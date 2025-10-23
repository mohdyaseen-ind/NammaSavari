import http, { createServer } from "http";
import { Server } from 'socket.io'
import cors from 'cors'

const server = http.createServer()

const io = new Server(server, {
  cors: {
    origin: "*",
  }
})

io.on("connection", socket=>{
  console.log(socket.id)

  socket.on('hello',(data)=>{
    console.log('📨 Client said:', data.message)
    socket.emit('hello-response', { message: 'Hi from server!' })
  })

  socket.on("disconnect",()=>{
    console.log('❌ Client disconnected:', socket.id)
  })
})

server.listen(3001,()=>{
  console.log("Server is listening")
})