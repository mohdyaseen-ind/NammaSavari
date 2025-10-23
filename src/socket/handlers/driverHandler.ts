import { Server, Socket } from 'socket.io'
import { DriverOnlineData, DriverLocationData, DriverOfflineData, OnlineDriver } from '../types'

// Store online drivers in memory
const onlineDrivers = new Map<string, OnlineDriver>()

export function setupDriverHandlers(io: Server, socket: Socket) {
  
  // Driver goes online
  socket.on('driver:online', (data: DriverOnlineData) => {
    const { userId, location, vehicleType, vehicleNumber, vehicleModel, licensePlate } = data
    
    const driver: OnlineDriver = {
      userId: userId,
      socketId: socket.id,
      location: location,
      vehicleInfo: {
        type: vehicleType,
        number: vehicleNumber,
        model: vehicleModel,
        licensePlate: licensePlate
      },
      status: 'available'
    }
    
    onlineDrivers.set(userId, driver)
    
    console.log(`🚗 Driver ${userId} is now ONLINE`)
    console.log(`📊 Total online drivers: ${onlineDrivers.size}`)
  })

  // Driver updates location
  socket.on('driver:location', (data: DriverLocationData) => {
    const { userId, location } = data
    
    const driver = onlineDrivers.get(userId)
    
    if (driver) {
      driver.location = location
      console.log(`📍 Driver ${userId} location updated:`, location)
    } else {
      console.log(`⚠️  Driver ${userId} not found`)
    }
  })

  // Driver goes offline
  socket.on('driver:offline', (data: DriverOfflineData) => {
    const { userId } = data
    
    onlineDrivers.delete(userId)
    
    console.log(`🔴 Driver ${userId} is now OFFLINE`)
    console.log(`📊 Total online drivers: ${onlineDrivers.size}`)
  })
}

// Helper functions
export function getOnlineDrivers() {
  return Array.from(onlineDrivers.values())
}

export function getDriver(userId: string) {
  return onlineDrivers.get(userId)
}

export function getOnlineDriverCount() {
  return onlineDrivers.size
}