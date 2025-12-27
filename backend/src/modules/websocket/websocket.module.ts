import { Module } from '@nestjs/common';
import { WsGateway } from './websocket.gateway';

@Module({
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WebSocketModule {}