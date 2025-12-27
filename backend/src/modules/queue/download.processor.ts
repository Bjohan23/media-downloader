import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { DownloadService } from '../download/download.service';
import { WsGateway } from '../websocket/websocket.gateway';
import * as ytdl from '@distube/ytdl-core';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Processor('download')
export class DownloadProcessor {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly wsGateway: WsGateway,
  ) {}

  @Process('download')
  async handleDownload(job: Job) {
    const { jobId, url, mediaType, quality, format } = job.data;
    
    try {
      await job.progress(10);
      
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim();
      const duration = parseInt(info.videoDetails.lengthSeconds, 10);
      const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

      await job.progress(20);

      const downloadPath = path.join(process.cwd(), '..', 'downloads');
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      const fileName = `${uuidv4()}-${title}.${format}`;
      const filePath = path.join(downloadPath, fileName);

      await job.progress(30);

      let options: ytdl.downloadOptions = {
        quality: this.getQualityLabel(quality),
      };

      if (mediaType === 'audio') {
        options.filter = 'audioonly';
      }

      return new Promise((resolve, reject) => {
        const stream = ytdl(url, options);
        let downloadedBytes = 0;
        let totalBytes = 0;

        stream.on('response', (res) => {
          totalBytes = parseInt(res.headers['content-length'] || '0');
        });

        stream.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const progress = Math.min(90, 30 + (downloadedBytes / totalBytes) * 60);
            job.progress(progress);
            
            this.wsGateway.broadcastJobUpdate({
              id: jobId,
              url,
              title,
              duration: this.formatDuration(duration),
              thumbnail,
              mediaType,
              quality,
              format,
              status: 'downloading',
              progress,
              createdAt: new Date(),
            });
          }
        });

        stream.on('error', (error) => {
          reject(error);
        });

        stream.on('end', () => {
          if (mediaType === 'audio' && !['mp3', 'm4a'].includes(format)) {
            ffmpeg(filePath)
              .toFormat(format)
              .on('end', () => {
                fs.unlinkSync(filePath);
                job.progress(100);
                
                const result = {
                  title,
                  duration: this.formatDuration(duration),
                  thumbnail,
                  downloadPath: `/downloads/${fileName}`,
                };

                this.wsGateway.broadcastJobUpdate({
                  id: jobId,
                  url,
                  title,
                  duration: this.formatDuration(duration),
                  thumbnail,
                  mediaType,
                  quality,
                  format,
                  status: 'completed',
                  progress: 100,
                  downloadPath: `/downloads/${fileName}`,
                  createdAt: new Date(),
                  completedAt: new Date(),
                });

                resolve(result);
              })
              .on('error', (error) => {
                reject(error);
              })
              .save(path.join(downloadPath, fileName.replace(/\.[^/.]+$/, `.${format}`)));
          } else {
            job.progress(100);
            
            const result = {
              title,
              duration: this.formatDuration(duration),
              thumbnail,
              downloadPath: `/downloads/${fileName}`,
            };

            this.wsGateway.broadcastJobUpdate({
              id: jobId,
              url,
              title,
              duration: this.formatDuration(duration),
              thumbnail,
              mediaType,
              quality,
              format,
              status: 'completed',
              progress: 100,
              downloadPath: `/downloads/${fileName}`,
              createdAt: new Date(),
              completedAt: new Date(),
            });

            resolve(result);
          }
        });

        stream.pipe(fs.createWriteStream(filePath));
      });
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      this.wsGateway.broadcastJobUpdate({
        id: jobId,
        url,
        title: '',
        duration: '',
        thumbnail: '',
        mediaType,
        quality,
        format,
        status: 'failed',
        progress: 0,
        errorMessage,
        createdAt: new Date(),
      });

      throw error;
    }
  }

  private getQualityLabel(quality: string): string {
    switch (quality) {
      case 'highest':
        return 'highest';
      case 'lowest':
        return 'lowest';
      case '144p':
        return '144p';
      case '360p':
        return '360p';
      case '720p':
        return '720p';
      case '1080p':
        return '1080p';
      case '4k':
        return '2160p';
      default:
        return 'highest';
    }
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