import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../theme';
import { Button, Input, SelectPicker, Card } from '../components';
import { DownloadPlatform, DownloadType, DownloadQuality, VideoFormat, AudioFormat } from '@/domain/entities';
import { useDownloadStore } from '../stores';

// Opciones para los selectores
const PLATFORM_OPTIONS = [
  { label: 'YouTube', value: DownloadPlatform.YOUTUBE },
  { label: 'Instagram', value: DownloadPlatform.INSTAGRAM },
  { label: 'TikTok', value: DownloadPlatform.TIKTOK },
  { label: 'Twitter', value: DownloadPlatform.TWITTER },
  { label: 'Facebook', value: DownloadPlatform.FACEBOOK },
];

const TYPE_OPTIONS: { label: string; value: DownloadType }[] = [
  { label: 'Video', value: DownloadType.VIDEO },
  { label: 'Audio', value: DownloadType.AUDIO },
];

const QUALITY_OPTIONS = [
  { label: '360p (Baja)', value: DownloadQuality.LOW },
  { label: '720p (HD)', value: DownloadQuality.MEDIUM },
  { label: '1080p (Full HD)', value: DownloadQuality.HIGH },
  { label: '4K (Ultra HD)', value: DownloadQuality.ULTRA },
];

const VIDEO_FORMAT_OPTIONS = [
  { label: 'MP4', value: VideoFormat.MP4 },
  { label: 'WebM', value: VideoFormat.WEBM },
  { label: 'MKV', value: VideoFormat.MKV },
];

const AUDIO_FORMAT_OPTIONS = [
  { label: 'MP3', value: AudioFormat.MP3 },
  { label: 'M4A', value: AudioFormat.M4A },
  { label: 'WAV', value: AudioFormat.WAV },
  { label: 'FLAC', value: AudioFormat.FLAC },
];

/**
 * Pantalla Home / Nueva Descarga
 */
const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addDownload, setError } = useDownloadStore();

  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState(DownloadPlatform.YOUTUBE);
  const [type, setType] = useState(DownloadType.VIDEO);
  const [quality, setQuality] = useState(DownloadQuality.HIGH);
  const [format, setFormat] = useState(VideoFormat.MP4);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ url?: string }>({});

  const formatOptions = type === DownloadType.VIDEO ? VIDEO_FORMAT_OPTIONS : AUDIO_FORMAT_OPTIONS;

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

  const handleDownload = useCallback(async () => {
    if (!validateUrl()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear solicitud de descarga
      const { DownloadRequest } = await import('@/domain/entities');

      const request = DownloadRequest.createVideoRequest(
        url.trim(),
        platform,
        quality,
        type === DownloadType.VIDEO ? format : format
      );

      // Simular creación (aquí iría el use case)
      const mockJob = {
        id: `job-${Date.now()}`,
        url: request.url,
        platform: request.platform,
        type: request.type,
        quality: request.quality,
        format: request.format,
        status: 'pending' as const,
        progress: 0,
        filename: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addDownload(mockJob);

      Alert.alert(
        'Descarga Iniciada',
        'Tu descarga ha sido agregada a la cola.',
        [{ text: 'OK', onPress: () => {} }]
      );

      // Limpiar formulario
      setUrl('');
      setPlatform(DownloadPlatform.YOUTUBE);
      setType(DownloadType.VIDEO);
      setQuality(DownloadQuality.HIGH);
      setFormat(VideoFormat.MP4);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la descarga');
      Alert.alert('Error', 'Error al crear la descarga. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [url, platform, type, quality, format, validateUrl, addDownload, setError]);

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

          <SelectPicker
            label="Plataforma"
            options={PLATFORM_OPTIONS}
            value={platform}
            onSelect={setPlatform}
            placeholder="Selecciona plataforma"
            containerStyle={{ marginTop: theme.spacing.lg }}
          />

          <SelectPicker
            label="Tipo"
            options={TYPE_OPTIONS}
            value={type}
            onSelect={(value) => {
              setType(value as DownloadType);
              setFormat(value === DownloadType.VIDEO ? VideoFormat.MP4 : AudioFormat.MP3);
            }}
            placeholder="Selecciona tipo"
            containerStyle={{ marginTop: theme.spacing.md }}
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
