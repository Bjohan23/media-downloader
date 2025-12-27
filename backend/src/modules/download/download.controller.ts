import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { DownloadService } from './download.service';
import { DownloadRequestDto, DownloadJobDto } from './dto/download.dto';

@Controller('api/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  async createDownloadJob(@Body() request: DownloadRequestDto): Promise<DownloadJobDto[]> {
    return this.downloadService.createDownloadJob(request);
  }

  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string): Promise<DownloadJobDto | null> {
    return this.downloadService.getJobStatus(jobId);
  }

  @Get()
  async getAllJobs(@Query('status') status?: string): Promise<DownloadJobDto[]> {
    const allJobs = await this.downloadService.getAllJobs();
    if (status) {
      return allJobs.filter(job => job.status === status);
    }
    return allJobs;
  }
}