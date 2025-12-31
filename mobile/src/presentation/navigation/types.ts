/**
 * Tipos de navegación
 */
export type RootTabParamList = {
  Home: undefined;
  Downloads: undefined;
};

export type HomeScreenParamList = {
  NewDownload: undefined;
};

export type DownloadsScreenParamList = {
  DownloadDetail: { jobId: string };
};
