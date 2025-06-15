import { useEffect, useRef, useState } from 'react';

interface Message {
  type: string;
  id?: string;
  sender?: string;
  text?: string;
  timestamp?: number;
  username?: string;
  roomId?: string;
  roomName?: string;
  message?: string;
}

export function useWebSocket() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>(null);

  const connect = () => {
    console.log(ws.current);
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    ws.current = new WebSocket('ws://localhost:3000/socket');

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'room-created') {
        setCurrentRoom({ id: message.roomId, name: message.roomName });
      } else if (message.type === 'room-joined') {
        setCurrentRoom({ id: message.roomId, name: message.roomName });
      }

      setMessages((prev) => [...prev, message]);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setCurrentRoom(null);
      console.log('WebSocket disconnected, attempting to reconnect...');

      // Attempt to reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const createRoom = (roomName: string, username: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: 'create-room', roomName, username })
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { type: 'error', message: 'Not connected to server' },
      ]);
    }
  };

  const joinRoom = (roomId: string, username: string) => {
    console.log('join room', roomId, username);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'join-room', roomId, username }));
    } else {
      setMessages((prev) => [
        ...prev,
        { type: 'error', message: 'Not connected to server' },
      ]);
    }
  };

  const sendMessage = (text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'chat-message', text }));
    } else {
      setMessages((prev) => [
        ...prev,
        { type: 'error', message: 'Not connected to server' },
      ]);
    }
  };

  return {
    messages,
    isConnected,
    currentRoom,
    setCurrentRoom,
    createRoom,
    joinRoom,
    sendMessage,
  };
}
