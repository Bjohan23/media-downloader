import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DownloadRequestDto, DownloadJobDto, MediaType, Quality, Format } from './dto/download.dto';
import { WsGateway } from '../websocket/websocket.gateway';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { URL } from 'url';

@Injectable()
export class DownloadService {
  private jobs: Map<string, DownloadJobDto> = new Map();

  constructor(private wsGateway: WsGateway) {}

  async createDownloadJob(request: DownloadRequestDto): Promise<DownloadJobDto[]> {
    const jobs: DownloadJobDto[] = [];

    for (const url of request.urls) {
      const jobId = uuidv4();
      const job: DownloadJobDto = {
        id: jobId,
        url,
        title: '',
        duration: '',
        thumbnail: '',
        mediaType: request.mediaType,
        quality: request.quality || Quality.HIGHEST,
        format: request.format || Format.MP4,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
      };

      jobs.push(job);
      this.jobs.set(jobId, job);
      this.wsGateway.broadcastJobUpdate(job);

      // Process download asynchronously
      this.processDownload(jobId, url, request.mediaType, request.quality || Quality.HIGHEST, request.format || Format.MP4);
    }

    return jobs;
  }

  private async processDownload(
    jobId: string,
    url: string,
    mediaType: MediaType,
    quality: string,
    format: string,
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Update status to downloading
      job.status = 'downloading';
      job.progress = 10;
      this.wsGateway.broadcastJobUpdate(job);

      // Create download directory
      const downloadPath = path.join(process.cwd(), 'downloads');
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      // Get video info first
      const info = await this.getVideoInfo(url);
      job.title = info.title;
      job.duration = info.duration;
      job.thumbnail = info.thumbnail;
      job.progress = 20;
      this.wsGateway.broadcastJobUpdate(job);

      // Build yt-dlp arguments
      const { args } = this.buildYtDlpArgs(url, downloadPath, mediaType, quality, format);

      // Get file list before download
      const filesBefore = fs.readdirSync(downloadPath);

      // Download video using yt-dlp
      await this.downloadWithYtDlp(args, job, downloadPath, filesBefore);

    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message || 'Unknown error occurred';
      this.wsGateway.broadcastJobUpdate(job);
    }
  }

  private async getVideoInfo(url: string): Promise<{ title: string; duration: string; thumbnail: string }> {
    return new Promise((resolve, reject) => {
      const args = [
        '--dump-json',
        '--no-playlist',
        url,
      ];

      const ytdlp = spawn('yt-dlp', args);
      let output = '';
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`yt-dlp info failed: ${errorOutput}`));
          return;
        }

        try {
          const info = JSON.parse(output);
          const duration = info.duration
            ? this.formatDuration(Math.floor(info.duration))
            : '';

          resolve({
            title: info.title || 'Unknown',
            duration,
            thumbnail: info.thumbnail || '',
          });
        } catch (error) {
          reject(new Error(`Failed to parse video info: ${error.message}`));
        }
      });
    });
  }

  private buildYtDlpArgs(
    url: string,
    downloadPath: string,
    mediaType: MediaType,
    quality: string,
    format: string,
  ): { args: string[]; outputTemplate: string } {
    const outputTemplate = path.join(downloadPath, '%(title)s.%(ext)s');
    const args = [
      '--no-playlist',
      '--newline',
      '--progress',
      '-o', outputTemplate,
    ];

    // Format selection
    if (mediaType === 'audio') {
      // Extract audio in the specified format
      args.push('-x', '--audio-format', format, '--audio-quality', '0');  // 0 = best quality
    } else {
      // Video format selection - use best available
      if (quality === 'highest') {
        args.push('-f', 'bestvideo+bestaudio/best', '--merge-output-format', format);
      } else {
        const formatString = this.getFormatString(quality, format);
        args.push('-f', formatString, '--merge-output-format', format);
      }
    }

    args.push(url);

    return { args, outputTemplate };
  }

  private getFormatString(quality: string, format: string): string {
    // Build format selector based on quality
    const qualityMap: Record<string, string> = {
      'highest': 'bestvideo',
      '4k': 'bestvideo[height<=2160]',
      '1080p': 'bestvideo[height<=1080]',
      '720p': 'bestvideo[height<=720]',
      '360p': 'bestvideo[height<=360]',
      '144p': 'worstvideo',
      'lowest': 'worstvideo',
    };

    const videoQuality = qualityMap[quality] || 'bestvideo';
    return `${videoQuality}+bestaudio/best`;
  }

  private async downloadWithYtDlp(args: string[], job: DownloadJobDto, downloadPath: string, filesBefore: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', args);
      let errorOutput = '';

      // Parse progress from stderr
      ytdlp.stderr.on('data', (data) => {
        const output = data.toString();
        errorOutput += output;

        // Parse progress: [download]  45.2% of 100.00MiB at  2.00MiB/s ETA 00:05
        const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1]);
          // Map 0-100% to 20-95% range (20% for info, 95% for download complete)
          job.progress = Math.round(20 + (progress * 0.75));
          this.wsGateway.broadcastJobUpdate(job);
        }
      });

      ytdlp.on('close', async (code) => {
        if (code !== 0) {
          job.status = 'failed';
          job.errorMessage = `Download failed: ${errorOutput}`;
          this.wsGateway.broadcastJobUpdate(job);
          reject(new Error(errorOutput));
          return;
        }

        // Find the new file
        const filesAfter = fs.readdirSync(downloadPath);
        const newFiles = filesAfter.filter(f => !filesBefore.includes(f));

        if (newFiles.length > 0) {
          // Filter out temporary files (.part, .temp, .ytdl, etc.)
          const completedFiles = newFiles.filter(f =>
            !f.endsWith('.part') &&
            !f.endsWith('.temp') &&
            !f.endsWith('.ytdl') &&
            !f.includes('.part-Frag') &&
            !f.endsWith('.f625') &&  // yt-dlp temp format
            !f.endsWith('.f625.mp4') &&
            !f.startsWith('tmp_')
          );

          if (completedFiles.length > 0) {
            // Get the most recently created file
            const downloadedFile = completedFiles
              .map(f => ({
                name: f,
                time: fs.statSync(path.join(downloadPath, f)).mtime.getTime(),
              }))
              .sort((a, b) => b.time - a.time)[0];

            job.downloadPath = `/downloads/${downloadedFile.name}`;
          } else {
            // If only temp files found, wait a moment and try again
            await new Promise(resolve => setTimeout(resolve, 1000));
            const finalFiles = fs.readdirSync(downloadPath);
            const finalNewFiles = finalFiles.filter(f =>
              !filesBefore.includes(f) &&
              !f.endsWith('.part') &&
              !f.endsWith('.temp') &&
              !f.endsWith('.ytdl') &&
              !f.includes('.part-Frag') &&
              !f.endsWith('.f625') &&
              !f.endsWith('.f625.mp4') &&
              !f.startsWith('tmp_')
            );

            if (finalNewFiles.length > 0) {
              const downloadedFile = finalNewFiles
                .map(f => ({
                  name: f,
                  time: fs.statSync(path.join(downloadPath, f)).mtime.getTime(),
                }))
                .sort((a, b) => b.time - a.time)[0];

              job.downloadPath = `/downloads/${downloadedFile.name}`;
            }
          }
        }

        job.status = 'completed';
        job.progress = 100;
        job.completedAt = new Date();
        this.wsGateway.broadcastJobUpdate(job);
        resolve(null);
      });

      ytdlp.on('error', (error) => {
        job.status = 'failed';
        job.errorMessage = error.message;
        this.wsGateway.broadcastJobUpdate(job);
        reject(error);
      });
    });
  }

  getJobStatus(jobId: string): DownloadJobDto | null {
    return this.jobs.get(jobId) || null;
  }

  getAllJobs(): DownloadJobDto[] {
    return Array.from(this.jobs.values());
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
