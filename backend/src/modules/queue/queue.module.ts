import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DownloadProcessor } from './download.processor';
import { DownloadModule } from '../download/download.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'download',
    }),
    DownloadModule,
    WebSocketModule,
  ],
  providers: [DownloadProcessor],
})
export class QueueModule {}