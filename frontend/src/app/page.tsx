'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { Download, Play, Music, FileVideo, CheckCircle, XCircle, Clock, Sun, Moon, Youtube, Link2, Sparkles, Zap, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  // Auto-update format when mediaType changes
  useEffect(() => {
    if (mediaType === 'audio') {
      setFormat('mp3');
    } else {
      setFormat('mp4');
    }
  }, [mediaType]);

  useEffect(() => {
    if (!mounted) return;

    const newSocket = io(API_URL);
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
      const response = await fetch(`${API_URL}/api/downloads`, {
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

  const handleDownload = (downloadPath: string) => {
    // Abrir en una nueva pestaña, el backend fuerza la descarga con Content-Disposition
    window.open(`${API_URL}${downloadPath}`, '_blank');
  };

  const clearCompleted = () => {
    setJobs(prev => prev.filter(j => j.status !== 'completed'));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'downloading':
        return <Download className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'failed':
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20';
      case 'downloading':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20';
      default:
        return '';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/60 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Download className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Media Downloader
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Descarga videos y audio de múltiples plataformas</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Panel - Download Form */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left duration-500 delay-100">
            <Card className="border-2 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow duration-300">
              <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-base sm:text-lg">Nueva Descarga</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Pega las URLs de YouTube, Vimeo, y más
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <Link2 className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">URLs (una por línea)</span>
                    </label>
                    <Textarea
                      placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      rows={4}
                      className="resize-none text-xs sm:text-sm border-2 focus:border-primary transition-colors"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs">Compatible con YouTube, Vimeo, SoundCloud y más</span>
                    </p>
                  </div>

                  {/* Media Type */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">Tipo de Medio</label>
                    <Select value={mediaType} onValueChange={(value: 'video' | 'audio') => setMediaType(value)}>
                      <SelectTrigger className="border-2 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <FileVideo className="w-4 h-4 text-blue-500" />
                            <div className="flex flex-col">
                              <span className="text-sm">Video</span>
                              <span className="text-xs text-muted-foreground">Con audio</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="audio">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-500" />
                            <div className="flex flex-col">
                              <span className="text-sm">Solo Audio</span>
                              <span className="text-xs text-muted-foreground">Extraer audio</span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quality */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">Calidad</label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="border-2 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highest">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Más alta</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="360p">360p (SD)</SelectItem>
                        <SelectItem value="144p">144p (Baja)</SelectItem>
                        <SelectItem value="lowest">Más baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">Formato</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="border-2 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getFormatOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-sm">{option.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    disabled={!urls.trim()}
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Iniciar Descarga</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Downloads Queue */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-right duration-500 delay-200">
            <Card className="border-2 shadow-xl shadow-primary/5 h-full">
              <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg lg:text-xl">
                  <span className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-base sm:text-lg lg:text-xl">Cola de Descargas</span>
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex gap-1 sm:gap-2">
                      <Badge variant="outline" className="border-2 font-semibold text-[10px] sm:text-xs">
                        {jobs.filter(j => j.status === 'downloading' || j.status === 'pending').length} Activas
                      </Badge>
                      <Badge variant="outline" className="border-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold text-[10px] sm:text-xs">
                        {jobs.filter(j => j.status === 'completed').length} Completadas
                      </Badge>
                    </div>
                    {jobs.filter(j => j.status === 'completed').length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCompleted}
                        className="h-7 sm:h-8 border-2 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-600 px-2 sm:px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Limpiar</span>
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Monitorea el progreso de tus descargas en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-2 sm:pr-4">
                  {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                        <Download className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Sin descargas</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                        Agrega algunas URLs en el formulario de la izquierda para comenzar a descargar tus medios favoritos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className={`group border-2 rounded-lg sm:rounded-xl p-3 sm:p-5 transition-all duration-300 hover:shadow-lg ${
                            job.status === 'completed'
                              ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30'
                              : job.status === 'failed'
                              ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
                              : job.status === 'downloading'
                              ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30'
                              : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                              <h3 className="font-semibold text-sm sm:text-base mb-1 truncate">
                                {job.title || 'Cargando información...'}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate font-mono">
                                {job.url}
                              </p>
                            </div>
                            <Badge className={`border-2 font-semibold text-[10px] sm:text-xs w-fit ${getStatusColor(job.status)}`}>
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                {getStatusIcon(job.status)}
                                <span className="capitalize text-[10px] sm:text-xs">{getStatusText(job.status)}</span>
                              </div>
                            </Badge>
                          </div>

                          {/* Thumbnail & Details */}
                          {job.thumbnail && (
                            <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                              <div className="relative group/thumbnail flex-shrink-0">
                                <img
                                  src={job.thumbnail}
                                  alt={job.title}
                                  className="w-24 h-14 sm:w-32 sm:h-20 object-cover rounded-lg shadow-md group-hover/thumbnail:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center">
                                  {job.mediaType === 'video' ? (
                                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                  ) : (
                                    <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-sm">
                                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="text-[10px] sm:text-xs">{job.duration || '--:--'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="text-[10px] sm:text-xs">{getQualityText(job.quality)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                    <FileVideo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="text-[10px] sm:text-xs">{job.format.toUpperCase()}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                    {job.mediaType === 'video' ? (
                                      <FileVideo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    ) : (
                                      <Music className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    )}
                                    <span className="text-[10px] sm:text-xs">{job.mediaType === 'video' ? 'Video' : 'Audio'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Progress Bar */}
                          {(job.status === 'downloading' || job.status === 'completed') && (
                            <div className="mb-3 sm:mb-4">
                              <div className="flex justify-between text-[10px] sm:text-sm mb-1 sm:mb-2">
                                <span className="font-medium">Progreso</span>
                                <span className="font-bold text-primary">{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2 sm:h-3 shadow-inner" />
                            </div>
                          )}

                          {/* Error Message */}
                          {job.errorMessage && (
                            <div className="bg-red-500/10 border-2 border-red-500/20 rounded-lg p-2 sm:p-3 text-[10px] sm:text-sm text-red-600 dark:text-red-400">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                <span className="font-medium text-[10px] sm:text-sm">{job.errorMessage}</span>
                              </div>
                            </div>
                          )}

                          {/* Download Button */}
                          {job.status === 'completed' && job.downloadPath && (
                            <div className="flex justify-end pt-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleDownload(job.downloadPath!)}
                                className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Descargar Archivo</span>
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
