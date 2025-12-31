import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { useTheme } from '../theme';
import { Button, Input, SelectPicker, Card } from '../components';
import { MediaType, Quality, Format } from '@/domain/entities';
import { useDownloadStore } from '../stores';
import { createDownloadUseCase, monitorJobUseCase } from '@/di';
import { logger } from '@/utils/logger';

// Opciones para los selectores
const TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: 'Video', value: MediaType.VIDEO },
  { label: 'Audio', value: MediaType.AUDIO },
];

const QUALITY_OPTIONS = [
  { label: 'Automática', value: Quality.AUTO },
  { label: 'Mejor (Highest)', value: Quality.HIGHEST },
  { label: 'Peor (Lowest)', value: Quality.LOWEST },
  { label: '144p', value: Quality.P144 },
  { label: '360p', value: Quality.P360 },
  { label: '720p HD', value: Quality.P720 },
  { label: '1080p Full HD', value: Quality.P1080 },
  { label: '4K Ultra HD', value: Quality.P4K },
];

const VIDEO_FORMAT_OPTIONS = [
  { label: 'MP4', value: Format.MP4 },
  { label: 'WebM', value: Format.WEBM },
  { label: 'AVI', value: Format.AVI },
  { label: 'MOV', value: Format.MOV },
];

const AUDIO_FORMAT_OPTIONS = [
  { label: 'MP3', value: Format.MP3 },
  { label: 'M4A', value: Format.M4A },
];

/**
 * Pantalla Home / Nueva Descarga
 */
const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addDownload, updateDownload, setError } = useDownloadStore();
  const monitoringIntervalRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const [url, setUrl] = useState('');
  const [type, setType] = useState(MediaType.VIDEO);
  const [quality, setQuality] = useState(Quality.HIGHEST);
  const [format, setFormat] = useState(Format.MP4);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ url?: string }>({});

  const formatOptions = type === MediaType.VIDEO ? VIDEO_FORMAT_OPTIONS : AUDIO_FORMAT_OPTIONS;

  const validateUrl = useCallback((): boolean => {
    const newErrors: { url?: string } = {};

    if (!url.trim()) {
      newErrors.url = 'La URL es requerida';
    } else if (!url.startsWith('http')) {
      newErrors.url = 'Formato de URL inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [url]);

  /**
   * Iniciar monitoreo de una descarga con polling
   */
  const startMonitoring = useCallback((jobId: string) => {
    logger.info('Iniciando monitoreo de descarga', { jobId });

    // Limpiar intervalo existente si hay uno
    const existing = monitoringIntervalRef.current.get(jobId);
    if (existing) {
      clearInterval(existing);
    }

    // Crear nuevo intervalo de polling
    const interval = setInterval(async () => {
      try {
        logger.debug('Polling job status', { jobId });

        const result = await monitorJobUseCase.executeOnce(jobId);

        if (result.success && result.data) {
          const job = result.data;

          logger.download('status update', {
            id: job.id,
            status: job.status,
            progress: job.progress,
            title: job.title,
          });

          // Actualizar en el store
          updateDownload(job.id, job);

          // Si ya terminó (completado o fallido), detener el monitoreo
          if (job.isCompleted() || job.hasFailed()) {
            logger.info('Descarga finalizada, deteniendo monitoreo', {
              id: job.id,
              status: job.status,
            });

            clearInterval(interval);
            monitoringIntervalRef.current.delete(jobId);

            // Notificar al usuario
            if (job.isCompleted()) {
              Alert.alert(
                '¡Descarga Completada!',
                job.title || 'Tu archivo está listo para descargar.',
                [{ text: 'OK' }]
              );
            } else if (job.hasFailed()) {
              Alert.alert(
                'Error en la Descarga',
                job.errorMessage || 'Hubo un error al descargar el archivo.',
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          logger.warn('Error al obtener estado de descarga', {
            jobId,
            error: result.error,
          });
        }
      } catch (error) {
        logger.error('Error en monitoreo de descarga', error);
      }
    }, 2000); // Polling cada 2 segundos

    monitoringIntervalRef.current.set(jobId, interval);

    // Timeout: detener después de 5 minutos (150 intentos de 2 segundos)
    setTimeout(() => {
      const intervalToClear = monitoringIntervalRef.current.get(jobId);
      if (intervalToClear) {
        clearInterval(intervalToClear);
        monitoringIntervalRef.current.delete(jobId);
        logger.warn('Timeout de monitoreo de descarga', { jobId });
      }
    }, 5 * 60 * 1000);
  }, [updateDownload]);

  const handleDownload = useCallback(async () => {
    if (!validateUrl()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info('Iniciando descarga', { url: url.trim(), type, quality, format });

      // Crear solicitud usando la nueva estructura
      const { DownloadRequest } = await import('@/domain/entities');

      const request = DownloadRequest.createSingle(
        url.trim(),
        type,
        quality,
        format
      );

      logger.debug('Request creada', request.toDTO());

      // Llamar al use case real (no mock)
      const result = await createDownloadUseCase.execute(request);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear la descarga');
      }

      const job = result.data;

      logger.download('job created', {
        id: job.id,
        url: job.url,
        status: job.status,
        progress: job.progress,
      });

      // Agregar al store
      addDownload(job);

      // Iniciar monitoreo
      startMonitoring(job.id);

      Alert.alert(
        'Descarga Iniciada',
        `Procesando: ${job.title || job.url}`,
        [
          {
            text: 'Ver Progreso',
            onPress: () => {
              // Navegar a la pantalla de descargas (opcional)
              logger.info('Navegar a descargas');
            },
          },
          { text: 'OK' }
        ]
      );

      // Limpiar URL pero mantener el resto de configuración
      setUrl('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la descarga';
      logger.error('Error en handleDownload', error);

      setError(errorMessage);
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [url, type, quality, format, validateUrl, addDownload, setError, startMonitoring]);

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      monitoringIntervalRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      monitoringIntervalRef.current.clear();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl2 }}
      >
        <Card variant="elevated">
          <Input
            label="URL de Video/Audio"
            icon="link"
            placeholder="Pega la URL aquí..."
            value={url}
            onChangeText={setUrl}
            error={errors.url}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Nota: El backend detecta la plataforma automáticamente */}

          <SelectPicker
            label="Tipo"
            options={TYPE_OPTIONS}
            value={type}
            onSelect={(value) => {
              setType(value as MediaType);
              setFormat(value === MediaType.VIDEO ? Format.MP4 : Format.MP3);
            }}
            placeholder="Selecciona tipo"
            containerStyle={{ marginTop: theme.spacing.lg }}
          />

          <SelectPicker
            label="Calidad"
            options={QUALITY_OPTIONS}
            value={quality}
            onSelect={setQuality}
            placeholder="Selecciona calidad"
            containerStyle={{ marginTop: theme.spacing.md }}
          />

          <SelectPicker
            label="Formato"
            options={formatOptions}
            value={format}
            onSelect={setFormat}
            placeholder="Selecciona formato"
            containerStyle={{ marginTop: theme.spacing.md }}
          />

          <Button
            title="Iniciar Descarga"
            onPress={handleDownload}
            loading={loading}
            icon="download"
            style={{ marginTop: theme.spacing.xl2 }}
            size="large"
          />

          {__DEV__ && (
            <View style={{ marginTop: theme.spacing.md, padding: theme.spacing.sm, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, color: '#666' }}>
                DEBUG INFO:{'\n'}
                URL: {url || '(vacía)'}{'\n'}
                Tipo: {type}{'\n'}
                Calidad: {quality}{'\n'}
                Formato: {format}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;
