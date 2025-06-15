import fastifyWebsocket, { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

interface ChatRoom {
  id: string;
  name: string;
  users: Map<string, string>; // Map of socketId to username
}

const chatRooms = new Map<string, ChatRoom>();
const socketConnections = new Map<string, WebSocket>(); // Map of socketId to WebSocket

export default async function (fastify: FastifyInstance) {
  await fastify.register(fastifyWebsocket);

  fastify.get('/socket', { websocket: true }, (socket) => {
    const socketId = Math.random().toString(36).substring(7);
    fastify.log.info(`Socket connected: ${socketId}`);
    socketConnections.set(socketId, socket);

    socket.on('message', (message: Buffer) => {
      const data = JSON.parse(message.toString());

      if (data.type === 'create-room') {
        const roomId = Math.random().toString(36).substring(7);
        const room: ChatRoom = {
          id: roomId,
          name: data.roomName,
          users: new Map([[socketId, data.username]]),
        };
        chatRooms.set(roomId, room);
        socket.send(
          JSON.stringify({
            type: 'room-created',
            roomId,
            roomName: data.roomName,
          })
        );
      } else if (data.type === 'join-room') {
        const room = chatRooms.get(data.roomId);
        if (room) {
          room.users.set(socketId, data.username);
          // Send confirmation to the joining user
          socket.send(
            JSON.stringify({
              type: 'room-joined',
              roomId: data.roomId,
              roomName: room.name,
            })
          );
          // Notify all users in the room
          room.users.forEach((username, id) => {
            if (id !== socketId) {
              const userSocket = socketConnections.get(id);
              if (userSocket) {
                userSocket.send(
                  JSON.stringify({
                    type: 'user-joined',
                    username: data.username,
                  })
                );
              }
            }
          });
        } else {
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Room not found',
            })
          );
        }
      } else if (data.type === 'chat-message') {
        const room = Array.from(chatRooms.values()).find((r) =>
          r.users.has(socketId)
        );
        if (room) {
          const username = room.users.get(socketId) || 'Unknown';
          const chatPayload = {
            type: 'chat-message',
            id: crypto.randomUUID(),
            sender: username,
            text: data.text,
            timestamp: Date.now(),
          };
          // Send to all users in the room
          room.users.forEach((_, id) => {
            const userSocket = socketConnections.get(id);
            if (userSocket) {
              userSocket.send(JSON.stringify(chatPayload));
            }
          });
        }
      }
    });

    socket.on('close', () => {
      // Find and remove user from their room
      for (const room of chatRooms.values()) {
        if (room.users.has(socketId)) {
          const username = room.users.get(socketId);
          room.users.delete(socketId);
          if (room.users.size === 0) {
            chatRooms.delete(room.id);
          } else {
            // Notify remaining users
            room.users.forEach((_, id) => {
              const userSocket = socketConnections.get(id);
              if (userSocket) {
                userSocket.send(
                  JSON.stringify({
                    type: 'user-left',
                    username,
                  })
                );
              }
            });
          }
          break;
        }
      }
      // Clean up socket connection
      socketConnections.delete(socketId);
    });
  });
}
