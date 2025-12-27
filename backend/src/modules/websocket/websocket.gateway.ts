import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DownloadJobDto } from '../download/dto/download.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-jobs')
  handleSubscribeJobs(client: Socket) {
    client.join('jobs');
    console.log(`Client ${client.id} subscribed to job updates`);
  }

  @SubscribeMessage('unsubscribe-jobs')
  handleUnsubscribeJobs(client: Socket) {
    client.leave('jobs');
    console.log(`Client ${client.id} unsubscribed from job updates`);
  }

  broadcastJobUpdate(job: DownloadJobDto) {
    this.server.to('jobs').emit('job-update', job);
  }

  broadcastNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.server.emit('notification', {
      message,
      type,
      timestamp: new Date(),
    });
  }
}