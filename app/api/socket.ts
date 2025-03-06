import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

interface CustomSocketServer extends HttpServer {
  io?: SocketIOServer;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    console.error('❌ res.socket is undefined!');
    res.status(500).json({ error: 'WebSocket server error' });
    return;
  }

  // Explicitly type the server
  const server = res.socket as unknown as CustomSocketServer;

  if (!server.io) {
    console.log('✅ Initializing new Socket.io server...');

    const io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    server.io = io; // Store it in the server object

    io.on('connection', (socket) => {
      console.log(`🟢 New client connected: ${socket.id}`);

      socket.on('message', (msg) => {
        console.log('📩 Message received:', msg);
        io.emit('message', msg);
      });

      socket.on('disconnect', () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);
      });
    });
  } else {
    console.log('ℹ️ Socket.io server already running.');
  }

  res.end();
}
