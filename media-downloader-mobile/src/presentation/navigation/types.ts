/**
 * Tipos de navegación
 */
export type RootStackParamList = {
  Home: undefined;
  Downloads: undefined;
  Auth: undefined;
};

export type HomeScreenParamList = {
  NewDownload: undefined;
};

export type DownloadsScreenParamList = {
  DownloadDetail: { jobId: string };
};
