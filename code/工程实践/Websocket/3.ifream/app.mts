
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.static(__dirname))

// 保存正在接收流的客户端
const clients = new Set<{
  res: express.Response
  timer: ReturnType<typeof setInterval>
}>()

app.get('/iframe-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-store')
  res.setHeader('X-Accel-Buffering', 'no')

  // 初始化 iframe 文档
  res.write(`<!DOCTYPE html><html><body><script>
    parent.onStreamMessage('连接成功')
  <\/script>`)

  // 持续向同一个 HTTP 响应写入 JavaScript
  const timer = setInterval(() => {
    const message = `服务器时间：${new Date().toLocaleTimeString()}`
    res.write(
      `<script>parent.onStreamMessage(${JSON.stringify(message)})<\/script>\n`
    )
  }, 1000)

  const client = { res, timer }
  clients.add(client)

  // 客户端断开时清理资源
  req.on('close', () => {
    clearInterval(timer)
    clients.delete(client)
  })
})

// 向所有已连接的 iframe 推送消息
app.post('/send', (req, res) => {
  const message = String(req.body.message ?? '')

  for (const client of clients) {
    if (!client.res.writableEnded) {
      client.res.write(
        `<script>parent.onStreamMessage(${JSON.stringify(message)})<\/script>\n`
      )
    }
  }

  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`服务器运行于 http://localhost:${PORT}`)
})
