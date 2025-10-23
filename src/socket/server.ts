import http, { createServer } from "http";
import { Server } from 'socket.io'
import cors from 'cors'
import { setupDriverHandlers } from "./handlers/driverHandler";

const server = http.createServer()

const io = new Server(server, {
  cors: {
    origin: "*",
  }
})

io.on("connection", socket=>{
  console.log(socket.id)

  setupDriverHandlers(io,socket)

  socket.on("disconnect",()=>{
    console.log('❌ Client disconnected:', socket.id)
  })
})

server.listen(3001,()=>{
  console.log("Server is listening")
})