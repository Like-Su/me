import express from 'express'
import { Server } from 'socket.io'
import http from 'node:http'
import fs from 'node:fs'

const app = express()


app.use(express.static(import.meta.dirname))

const httpServer = http.createServer(app)

const io = new Server(httpServer)

app.get('/socket/socket.js', (_, res) => {
  const jsScript = fs.readFileSync('./node_modules/socket.io/client-dist/socket.io.js')
  // res.setHeader('Content-Type', 'application/js')
  res.send(jsScript)
})


io.of('/news').on('connection', (socket) => {
  console.log('[server] receive', socket)
  socket.emit('message', 'hello client')
  socket.on('message', msg => {
    console.log('[server] receive msg', msg)
    socket.send('[server] ', msg)
  })
})


httpServer.listen(3000)
// app.listen(8080)