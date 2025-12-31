import { create } from 'zustand';
import { DownloadJob } from '@/domain/entities';

/**
 * Estado de descargas
 */
interface DownloadsState {
  downloads: DownloadJob[];
  activeJobs: Map<string, NodeJS.Timeout>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Acciones de descargas
 */
interface DownloadsActions {
  setDownloads: (downloads: DownloadJob[]) => void;
  addDownload: (download: DownloadJob) => void;
  updateDownload: (jobId: string, updated: DownloadJob) => void;
  removeDownload: (jobId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clear: () => void;
  getDownloadsByStatus: (status: string) => DownloadJob[];
  getDownloadById: (jobId: string) => DownloadJob | undefined;
}

/**
 * Store de descargas
 */
export const useDownloadStore = create<DownloadsState & DownloadsActions>((set, get) => ({
  // Estado inicial
  downloads: [],
  activeJobs: new Map(),
  isLoading: false,
  error: null,

  // Acciones
  setDownloads: (downloads) =>
    set((state) => ({
      ...state,
      downloads,
      error: null,
    })),

  addDownload: (download) =>
    set((state) => ({
      ...state,
      downloads: [download, ...state.downloads],
      error: null,
    })),

  updateDownload: (jobId, updated) =>
    set((state) => ({
      ...state,
      downloads: state.downloads.map((job) =>
        job.id === jobId ? updated : job
      ),
    })),

  removeDownload: (jobId) =>
    set((state) => ({
      ...state,
      downloads: state.downloads.filter((job) => job.id !== jobId),
    })),

  setLoading: (isLoading) =>
    set((state) => ({
      ...state,
      isLoading,
    })),

  setError: (error) =>
    set((state) => ({
      ...state,
      error,
    })),

  clearError: () =>
    set((state) => ({
      ...state,
      error: null,
    })),

  clear: () =>
    set({
      downloads: [],
      activeJobs: new Map(),
      isLoading: false,
      error: null,
    }),

  // Selectores
  getDownloadsByStatus: (status) => {
    const { downloads } = get();
    return downloads.filter((job) => job.status === status);
  },

  getDownloadById: (jobId) => {
    const { downloads } = get();
    return downloads.find((job) => job.id === jobId);
  },
}));
