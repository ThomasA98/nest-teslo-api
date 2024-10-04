import { Server, Socket } from 'socket.io';

import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, /* ...args: any[] */) {

    const token = client?.handshake?.headers?.authentication ?? '';

    try {
      const payload = this.jwtService.verify<JwtPayload>(token.toString());
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients()
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients()
    );

  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    // Emite solo al cliente
    // client.emit(
    //  'message-from-server',
    //  {
    //    fullName: '',
    //    message: payload?.message ?? 'no message',
    //  }
    // );

    // emitir a todos menos al cliente
    // client.broadcast.emit(
    //   'message-from-server',
    //   {
    //     fullName: '',
    //     message: payload?.message ?? 'no message',
    //   }
    // );

    // emitir a todos los conectados al websocket
    this.wss.emit(
      'message-from-server',
      {
        fullName: this.messagesWsService.getUSerFullName(client.id),
        message: payload?.message ?? 'no message',
      }
    );

  }

}
