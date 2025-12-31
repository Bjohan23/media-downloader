import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Card, ProgressBar, Button, Text } from '../components';
import { useDownloadStore } from '../stores';
import { DownloadStatus, DownloadJob } from '@/domain/entities';

/**
 * Componente Item de Descarga (optimizado con React.memo)
 */
interface DownloadItemProps {
  job: DownloadJob;
  onPress?: (job: DownloadJob) => void;
  onDownload?: (job: DownloadJob) => void;
  onRetry?: (job: DownloadJob) => void;
}

const DownloadItem = React.memo<DownloadItemProps>(({
  job,
  onPress,
  onDownload,
  onRetry,
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (job.status) {
      case DownloadStatus.PENDING:
        return theme.colors.warning;
      case DownloadStatus.PROCESSING:
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
      case DownloadStatus.PROCESSING:
        return 'Procesando';
      case DownloadStatus.COMPLETED:
        return 'Completado';
      case DownloadStatus.FAILED:
        return 'Fallido';
      default:
        return 'Desconocido';
    }
  };

  const getPlatformIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (job.platform) {
      case 'youtube':
        return 'logo-youtube';
      case 'instagram':
        return 'logo-instagram';
      case 'tiktok':
        return 'musical-notes';
      case 'twitter':
        return 'logo-twitter';
      case 'facebook':
        return 'logo-facebook';
      default:
        return 'link';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(job)}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={{ marginBottom: theme.spacing.sm }}>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Ionicons
                    name={
                      job.type === 'video'
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
                </View>
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

        {job.status === DownloadStatus.PROCESSING && (
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

        {job.status === DownloadStatus.COMPLETED && job.filename && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: theme.spacing.sm,
            }}
          >
            <Button
              title="Descargar"
              onPress={() => onDownload?.(job)}
              type="primary"
              size="small"
              icon="download"
            />
          </View>
        )}

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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: theme.spacing.sm,
              }}
            >
              <Button
                title="Reintentar"
                onPress={() => onRetry?.(job)}
                type="outline"
                size="small"
                icon="refresh"
              />
            </View>
          </View>
        )}

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

  // Cargar descargas
  const loadDownloads = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      // Aquí iría la llamada al use case
      // Por ahora, usamos los datos del store
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar descargas');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [setLoading, setError]);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const keyExtractor = useCallback((item: DownloadJob) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: DownloadJob }) => (
      <DownloadItem
        job={item}
        onDownload={(job) => {
          console.log('Download file:', job.filename);
        }}
        onRetry={(job) => {
          console.log('Retry job:', job.id);
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
        {(['all', DownloadStatus.PENDING, DownloadStatus.PROCESSING, DownloadStatus.COMPLETED] as const).map(
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
                  ? 'All'
                  : status.replace('_', ' ')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DownloadsScreen;
