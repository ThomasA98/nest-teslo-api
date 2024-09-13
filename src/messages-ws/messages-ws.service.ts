import { Socket } from 'socket.io';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

export interface ConnectedClients {
    [ id: string ]: {
        socket: Socket,
        user: User,
    },
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({ id: userId, isActive: true });

        if (!user) throw new Error('User not found');

        this.checkUserConnection(user);

        this.connectedClients[client.id] = {
            socket: client,
            user,
        };

    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients).flatMap(key => key);
    }

    getUSerFullName(socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }

    private checkUserConnection(newUserToConnect: User) {
        for (const { user, socket } of Object.values(this.connectedClients))
            if (user.id === newUserToConnect.id) return socket.disconnect();
    }

}
