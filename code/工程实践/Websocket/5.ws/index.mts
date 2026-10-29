import express from 'express'
// https://www.npmjs.com/package/ws
import { WebSocketServer } from 'ws'
const app = express()

app.use(express.static(import.meta.dirname))

const server = new WebSocketServer({ port: 8888 })

server.on('connection', (socket) => {
  // console.log(socket, '连接成功');
  // 监听客户端的消息
  socket.on('message', (msg) => {
    console.log('[server] print(', msg.toString('utf-8'), ')')
    socket.send('server: ' + msg.toString('utf-8'))
  })
})


server.on('close', () => {
  console.log('close')
})

app.listen(8000)