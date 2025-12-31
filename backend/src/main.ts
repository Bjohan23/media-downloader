import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function displayServerInfo(port: number) {
  const localIP = getLocalIP();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          🚀 MEDIA DOWNLOADER API - SERVIDOR INICIADO       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📍 URLs DE ACCESO:');
  console.log(`   • Local:          http://localhost:${port}`);
  console.log(`   • Red Local:      http://${localIP}:${port}`);
  console.log(`   • Documentación:  http://localhost:${port}/api\n`);

  console.log('📋 ENDPOINTS DISPONIBLES:\n');

  console.log('🔐 AUTENTICACIÓN (/api/auth):');
  console.log('   • POST   /api/auth/register    - Registrar nuevo usuario');
  console.log('   • POST   /api/auth/login       - Iniciar sesión');
  console.log('   • GET    /api/auth/me          - Obtener perfil (requiere token)\n');

  console.log('📥 DESCARGAS (/api/downloads):');
  console.log('   • POST   /api/downloads              - Crear trabajo de descarga');
  console.log('   • GET    /api/downloads              - Listar todos los trabajos');
  console.log('   • GET    /api/downloads?status=X     - Filtrar por estado');
  console.log('   • GET    /api/downloads/:jobId       - Obtener estado de un trabajo');
  console.log('   • GET    /api/downloads/download-file/:filename - Descargar archivo\n');

  console.log('📁 ARCHIVOS ESTÁTICOS:');
  console.log('   • GET    /downloads/*              - Acceder a archivos descargados\n');

  console.log('📚 SWAGGER DOCUMENTACIÓN:');
  console.log('   • GET    /api                      - Documentación interactiva\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from downloads directory
  const downloadsPath = join(process.cwd(), 'downloads');
  app.useStaticAssets(downloadsPath, {
    prefix: '/downloads/',
  });

  // Configuración de CORS para desarrollo y producción
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: isDevelopment
      ? true // Permitir cualquier origen en desarrollo
      : [
          process.env.FRONTEND_URL || 'https://mediadownloader.com',
          'https://mediadownloader.com',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Length'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Media Downloader API')
    .setDescription('API for downloading media from multiple platforms')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  displayServerInfo(port);
}
bootstrap();