import { DownloadRequest, DownloadJob } from '@/types';
import { config } from '@/lib/config';

const API_URL = config.apiUrl;

export const downloadApi = {
  async createDownloadJob(request: DownloadRequest): Promise<DownloadJob[]> {
    const response = await fetch(`${API_URL}/api/downloads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create download job');
    }

    return response.json();
  },

  async getJobStatus(jobId: string): Promise<DownloadJob | null> {
    const response = await fetch(`${API_URL}/api/downloads/${jobId}`);

    if (!response.ok) {
      throw new Error('Failed to get job status');
    }

    return response.json();
  },

  async getAllJobs(status?: string): Promise<DownloadJob[]> {
    const url = status ? `${API_URL}/api/downloads?status=${status}` : `${API_URL}/api/downloads`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get jobs');
    }

    return response.json();
  },
};