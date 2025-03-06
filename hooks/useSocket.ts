import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
}

const socket: Socket = io({ path: '/api/socket' });

export function useSocket() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.on('receiveMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = (messageData: Message) => {
    socket.emit('sendMessage', messageData);
  };

  return { messages, sendMessage };
}
