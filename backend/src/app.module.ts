import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DownloadModule } from './modules/download/download.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './common/prisma.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'downloads'),
      serveRoot: '/downloads',
    }),
    DownloadModule,
    WebSocketModule,
  ],
})
export class AppModule {}