'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { Download, Play, Music, FileVideo, CheckCircle, XCircle, Clock, ExternalLink, Sun, Moon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface DownloadJob {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  mediaType: 'video' | 'audio';
  quality: string;
  format: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadPath?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export default function Home() {
  const [urls, setUrls] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [quality, setQuality] = useState('highest');
  const [format, setFormat] = useState('mp4');
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('subscribe-jobs');

    newSocket.on('job-update', (job: DownloadJob) => {
      setJobs(prev => {
        const existingIndex = prev.findIndex(j => j.id === job.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = job;
          return updated;
        }
        return [...prev, job];
      });
    });

    newSocket.on('notification', (notification) => {
      console.log('Notificación:', notification);
    });

    return () => {
      newSocket.emit('unsubscribe-jobs');
      newSocket.close();
    };
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urls.trim()) return;

    const urlList = urls.split('\n').filter(url => url.trim());
    
    try {
      const response = await fetch('http://localhost:3001/api/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: urlList,
          mediaType,
          quality,
          format,
        }),
      });

      if (response.ok) {
        setUrls('');
      }
    } catch (error) {
      console.error('Error al crear trabajos de descarga:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'downloading':
        return <Download className="w-4 h-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'downloading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En cola';
      case 'downloading':
        return 'Descargando';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Error';
      default:
        return status;
    }
  };

  const getFormatOptions = () => {
    if (mediaType === 'audio') {
      return [
        { value: 'mp3', label: 'MP3' },
        { value: 'm4a', label: 'M4A' },
        { value: 'wav', label: 'WAV' },
      ];
    }
    return [
      { value: 'mp4', label: 'MP4' },
      { value: 'webm', label: 'WEBM' },
      { value: 'avi', label: 'AVI' },
      { value: 'mov', label: 'MOV' },
    ];
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'highest':
        return 'Más alta';
      case 'lowest':
        return 'Más baja';
      default:
        return quality;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Media Downloader</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Nueva Descarga
                </CardTitle>
                <CardDescription>
                  Agrega URLs para descargar desde múltiples plataformas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      URLs (una por línea)
                    </label>
                    <Textarea
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Tipo de Medio
                    </label>
                    <Select value={mediaType} onValueChange={(value: 'video' | 'audio') => setMediaType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <FileVideo className="w-4 h-4" />
                            Video
                          </div>
                        </SelectItem>
                        <SelectItem value="audio">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Solo Audio
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Calidad
                    </label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highest">Más alta</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="360p">360p</SelectItem>
                        <SelectItem value="144p">144p</SelectItem>
                        <SelectItem value="lowest">Más baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Formato
                    </label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getFormatOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={!urls.trim()}>
                    <Download className="w-4 h-4 mr-2" />
                    Iniciar Descarga
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Cola de Descargas ({jobs.length})
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {jobs.filter(j => j.status === 'downloading').length} Activas
                    </Badge>
                    <Badge variant="outline">
                      {jobs.filter(j => j.status === 'completed').length} Completadas
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Monitorea el progreso de tus descargas en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay descargas aún. ¡Agrega algunas URLs para comenzar!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {job.title || 'Cargando...'}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {job.url}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge className={getStatusColor(job.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(job.status)}
                                  <span className="capitalize">{getStatusText(job.status)}</span>
                                </div>
                              </Badge>
                            </div>
                          </div>

                          {job.thumbnail && (
                            <div className="flex gap-4 mb-3">
                              <img
                                src={job.thumbnail}
                                alt={job.title}
                                className="w-20 h-14 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{job.duration}</span>
                                  <span>{getQualityText(job.quality)}</span>
                                  <span>{job.format.toUpperCase()}</span>
                                  <span>{job.mediaType === 'video' ? 'Video' : 'Audio'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {(job.status === 'downloading' || job.status === 'completed') && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso</span>
                                <span>{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                            </div>
                          )}

                          {job.errorMessage && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-700 dark:text-red-300">
                              {job.errorMessage}
                            </div>
                          )}

                          {job.status === 'completed' && job.downloadPath && (
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={`http://localhost:3001${job.downloadPath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Descargar
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}