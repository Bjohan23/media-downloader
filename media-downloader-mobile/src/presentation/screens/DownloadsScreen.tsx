import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '../theme';
import { Card, ProgressBar, Button, Text } from '../components';
import { useDownloadStore } from '../stores';
import { DownloadStatus, DownloadJob, MediaType } from '@/domain/entities';
import { getAllDownloadsUseCase } from '@/di';
import { logger } from '@/utils/logger';
import * as FileSystem from 'expo-file-system';
import API_CONFIG from '@/data/services/api.config';

/**
 * Componente Item de Descarga (optimizado con React.memo)
 */
interface DownloadItemProps {
  job: DownloadJob;
  onPress?: (job: DownloadJob) => void;
  onDownload?: (job: DownloadJob) => void;
}

const DownloadItem = React.memo<DownloadItemProps>(({
  job,
  onPress,
  onDownload,
}) => {
  const { theme } = useTheme();
  const [downloading, setDownloading] = React.useState(false);

  const getStatusColor = () => {
    switch (job.status) {
      case DownloadStatus.PENDING:
        return theme.colors.warning;
      case DownloadStatus.DOWNLOADING:
        return theme.colors.primary;
      case DownloadStatus.COMPLETED:
        return theme.colors.success;
      case DownloadStatus.FAILED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case DownloadStatus.PENDING:
        return 'Pendiente';
      case DownloadStatus.DOWNLOADING:
        return 'Descargando';
      case DownloadStatus.COMPLETED:
        return 'Completado';
      case DownloadStatus.FAILED:
        return 'Fallido';
      default:
        return 'Desconocido';
    }
  };

  // Inferir plataforma desde la URL (para mostrar el icono correcto)
  const getPlatformIcon = (): keyof typeof Ionicons.glyphMap => {
    const url = job.url.toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'logo-youtube';
    } else if (url.includes('instagram.com')) {
      return 'logo-instagram';
    } else if (url.includes('tiktok.com')) {
      return 'musical-notes';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'logo-twitter';
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return 'logo-facebook';
    }
    return 'link';
  };

  const handleDownloadFile = async () => {
    const filename = job.getFilename();
    if (!filename) {
      logger.warn('No hay filename para descargar', { jobId: job.id });
      Alert.alert('Error', 'No se encontró el nombre del archivo');
      return;
    }

    setDownloading(true);
    try {
      logger.info('Descargando archivo a galería', { filename });

      // 1. Pedir permisos
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitas dar permiso para guardar fotos/videos en tu galería',
          [{ text: 'OK' }]
        );
        return;
      }

      // 2. Descargar archivo temporalmente
      const downloadUrl = `${API_CONFIG.baseURL}/api/downloads/download-file/${filename}`;
      const localUri = FileSystem.documentDirectory + filename;

      logger.info('Descargando desde', { url: downloadUrl });
      logger.info('Guardando en', { uri: localUri });

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri);

      if (downloadResult.status !== 200) {
        throw new Error('Error al descargar el archivo');
      }

      logger.info('Archivo descargado, guardando en galería...');

      // 3. Guardar en la galería
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

      logger.info('Archivo guardado en galería', { asset });

      // 4. Crear álbum si no existe
      const albumName = 'Media Downloader';
      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        }
      }

      // 5. Limpiar archivo temporal
      await FileSystem.deleteAsync(localUri, { idempotent: true });

      Alert.alert(
        '¡Éxito!',
        `Archivo guardado en tu galería${Platform.OS === 'android' ? ' (álbum: Media Downloader)' : ''}`,
        [{ text: 'OK' }]
      );

      onDownload?.(job);
    } catch (error) {
      logger.error('Error al descargar archivo', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo descargar el archivo',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(job)}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={{ marginBottom: theme.spacing.sm }}>
        {/* Header: Icono de plataforma + Info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}
        >
          <Ionicons
            name={getPlatformIcon()}
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.sm }}
          />
          <View style={{ flex: 1 }}>
            {/* Título (si está disponible) */}
            {job.title ? (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {job.title}
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  flex: 1,
                }}
              >
                <Ionicons
                  name={
                    job.mediaType === MediaType.VIDEO
                      ? 'videocam'
                      : 'musical-notes'
                  }
                  size={14}
                  color={theme.colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                }}>
                  {job.quality.toUpperCase()}
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginLeft: theme.spacing.sm,
                }}>
                  {job.format.toUpperCase()}
                </Text>
                {job.duration ? (
                  <Text style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginLeft: theme.spacing.sm,
                  }}>
                    {job.duration}
                  </Text>
                ) : null}
              </View>

              <View
                style={{
                  backgroundColor: getStatusColor() + '20',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: '600',
                    color: getStatusColor(),
                    textTransform: 'uppercase',
                  }}
                >
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Barra de progreso durante la descarga */}
        {job.status === DownloadStatus.DOWNLOADING && (
          <View style={{ marginTop: theme.spacing.sm }}>
            <ProgressBar progress={job.progress} />
            <Text
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs,
                textAlign: 'right',
              }}
            >
              {job.progress}%
            </Text>
          </View>
        )}

        {/* Botón de descarga cuando está completado */}
        {job.status === DownloadStatus.COMPLETED && job.downloadPath && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: theme.spacing.sm,
            }}
          >
            <Button
              title="Descargar Archivo"
              onPress={handleDownloadFile}
              loading={downloading}
              type="primary"
              size="small"
              icon="download"
            />
          </View>
        )}

        {/* Mensaje de error cuando falló */}
        {job.status === DownloadStatus.FAILED && job.errorMessage && (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.error,
              }}
            >
              {job.errorMessage}
            </Text>
          </View>
        )}

        {/* Fecha de creación */}
        <Text
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.sm,
          }}
        >
          {new Date(job.createdAt).toLocaleString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );
});

DownloadItem.displayName = 'DownloadItem';

/**
 * Pantalla de Descargas
 */
const DownloadsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { downloads, setDownloads, setLoading, setError } = useDownloadStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<DownloadStatus | 'all'>('all');

  // Filtrar descargas
  const filteredDownloads = useMemo(() => {
    if (filter === 'all') {
      return downloads;
    }
    return downloads.filter((job) => job.status === filter);
  }, [downloads, filter]);

  // Cargar descargas desde el backend
  const loadDownloads = useCallback(async () => {
    logger.info('Cargando descargas desde el backend');
    setRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await getAllDownloadsUseCase.execute();

      if (result.success && result.data) {
        logger.info('Descargas cargadas', { count: result.data.length });
        setDownloads(result.data);
      } else {
        logger.warn('Error al cargar descargas', { error: result.error });
        setError(result.error || 'Error al cargar descargas');
      }
    } catch (error) {
      logger.error('Error en loadDownloads', error);
      setError(error instanceof Error ? error.message : 'Error al cargar descargas');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [setDownloads, setLoading, setError]);

  // Cargar al montar
  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const keyExtractor = useCallback((item: DownloadJob) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: DownloadJob }) => (
      <DownloadItem
        job={item}
        onDownload={(job) => {
          logger.info('Archivo descargado', {
            id: job.id,
            filename: job.getFilename(),
          });
        }}
      />
    ),
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filtros */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.background,
          borderBottomWidth: theme.borders.width.thin,
          borderBottomColor: theme.colors.border,
        }}
      >
        {(['all', DownloadStatus.PENDING, DownloadStatus.DOWNLOADING, DownloadStatus.COMPLETED] as const).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={{
                flex: 1,
                paddingVertical: theme.spacing.sm,
                marginRight: theme.spacing.sm,
                backgroundColor:
                  filter === status
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                borderRadius: theme.borders.radius.md,
                alignItems: 'center',
              }}
              onPress={() => setFilter(status)}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: '600',
                  color:
                    filter === status
                      ? '#FFFFFF'
                      : theme.colors.textPrimary,
                  textTransform: 'capitalize',
                }}
              >
                {status === 'all'
                  ? 'Todas'
                  : getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Lista de descargas */}
      <FlatList
        data={filteredDownloads}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          padding: theme.spacing.md,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadDownloads}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: theme.spacing.xl3,
            }}
          >
            <Ionicons
              name="download-outline"
              size={64}
              color={theme.colors.textSecondary}
              style={{ marginBottom: theme.spacing.md }}
            />
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}
            >
              No hay descargas aún
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              }}
            >
              Inicia una nueva descarga desde la pantalla principal
            </Text>
          </View>
        }
      />
    </View>
  );
};

/**
 * Obtener label para el filtro de estado
 */
const getStatusLabel = (status: DownloadStatus): string => {
  switch (status) {
    case DownloadStatus.PENDING:
      return 'Pendientes';
    case DownloadStatus.DOWNLOADING:
      return 'Descargando';
    case DownloadStatus.COMPLETED:
      return 'Completadas';
    case DownloadStatus.FAILED:
      return 'Fallidas';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DownloadsScreen;
