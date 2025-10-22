import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedUrl = parse(req.url || '', true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req?.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  });

  // Socket.io server
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store online drivers in memory
  const onlineDrivers = new Map<string, { socketId: string; location: any }>();

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('driver:online', (data: { driverId: string; location: any }) => {
      const { driverId, location } = data;

      onlineDrivers.set(driverId, {
        socketId: socket.id,
        location: location || null
      });

      console.log(`🚗 Driver ${driverId} is now ONLINE`);
      console.log(`📍 Total online drivers: ${onlineDrivers.size}`);
    });

    socket.on('driver:location', (data: { driverId: string; location: any }) => {
      const { driverId, location } = data;

      if (onlineDrivers.has(driverId)) {
        onlineDrivers.get(driverId)!.location = location;
        console.log(`📍 Driver ${driverId} location updated:`, location);
      }
    });

    socket.on('driver:offline', (data: { driverId: string }) => {
      const { driverId } = data;
      onlineDrivers.delete(driverId);
      console.log(`🔴 Driver ${driverId} is now OFFLINE`);
      console.log(`📍 Total online drivers: ${onlineDrivers.size}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);

      for (const [driverId, data] of onlineDrivers.entries()) {
        if (data.socketId === socket.id) {
          onlineDrivers.delete(driverId);
          console.log(`🔴 Driver ${driverId} removed due to disconnect`);
          break;
        }
      }
    });

    socket.on('rider:find-drivers', (data: { location: any; radius: number }) => {
      const drivers = Array.from(onlineDrivers.entries()).map(([driverId, data]) => ({
        driverId,
        location: data.location
      }));

      socket.emit('rider:drivers-found', { drivers });
      console.log(`🔍 Rider searching for drivers. Found: ${drivers.length}`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.io server running');
    });
});
