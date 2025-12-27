import { Controller, Post, Get, Body, Param, Query, Res, NotFoundException } from '@nestjs/common';
import { DownloadService } from './download.service';
import { DownloadRequestDto, DownloadJobDto } from './dto/download.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  async createDownloadJob(@Body() request: DownloadRequestDto): Promise<DownloadJobDto[]> {
    return this.downloadService.createDownloadJob(request);
  }

  @Get()
  async getAllJobs(@Query('status') status?: string): Promise<DownloadJobDto[]> {
    const allJobs = await this.downloadService.getAllJobs();
    if (status) {
      return allJobs.filter(job => job.status === status);
    }
    return allJobs;
  }

  // RUTA ESPECÍFICA DEBE IR ANTES DE LA GENÉRICA
  @Get('download-file/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'downloads', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found: ${filename}`);
    }

    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    res.setHeader('Content-Type', this.getContentType(filename));
    res.setHeader('Content-Length', fileStats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    fileStream.pipe(res);
  }

  // RUTA GENÉRICA DEBE IR AL FINAL
  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string): Promise<DownloadJobDto | null> {
    return this.downloadService.getJobStatus(jobId);
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.wav': 'audio/wav',
      '.flac': 'audio/flac',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }
}
