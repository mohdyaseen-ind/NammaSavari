const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.io server
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, specify your domain
      methods: ['GET', 'POST']
    }
  })

  // Store online drivers in memory
  // In production, you'd use Redis or similar
  const onlineDrivers = new Map() // driverId -> { socketId, location }

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id)

    // Driver goes online
    socket.on('driver:online', (data) => {
      const { driverId, location } = data
      
      onlineDrivers.set(driverId, {
        socketId: socket.id,
        location: location || null
      })

      console.log(`🚗 Driver ${driverId} is now ONLINE`)
      console.log(`📍 Total online drivers: ${onlineDrivers.size}`)
    })

    // Driver updates location
    socket.on('driver:location', (data) => {
      const { driverId, location } = data
      
      if (onlineDrivers.has(driverId)) {
        onlineDrivers.get(driverId).location = location
        console.log(`📍 Driver ${driverId} location updated:`, location)
      }
    })

    // Driver goes offline
    socket.on('driver:offline', (data) => {
      const { driverId } = data
      onlineDrivers.delete(driverId)
      console.log(`🔴 Driver ${driverId} is now OFFLINE`)
      console.log(`📍 Total online drivers: ${onlineDrivers.size}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
      
      // Remove driver from online list if they disconnect
      for (const [driverId, data] of onlineDrivers.entries()) {
        if (data.socketId === socket.id) {
          onlineDrivers.delete(driverId)
          console.log(`🔴 Driver ${driverId} removed due to disconnect`)
          break
        }
      }
    })

    // Get nearby drivers (we'll use this later)
    socket.on('rider:find-drivers', (data) => {
      const { location, radius } = data // location: { lat, lng }, radius in km
      
      // For now, just return all online drivers
      // Later we'll add geospatial filtering
      const drivers = Array.from(onlineDrivers.entries()).map(([driverId, data]) => ({
        driverId,
        location: data.location
      }))

      socket.emit('rider:drivers-found', { drivers })
      console.log(`🔍 Rider searching for drivers. Found: ${drivers.length}`)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io server running`)
    })
})