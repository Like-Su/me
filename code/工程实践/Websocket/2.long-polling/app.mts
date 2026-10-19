import express from 'express'

const app = express()
const PORT = 8000
const TIMEOUT = 30000

app.use(express.json())
app.use(express.static(import.meta.dirname))

// 保存正在等待响应的客户端
const clients = new Set()

// 保存暂时无人接收的消息
const messages: any = []

// 长轮询接口
app.get('/poll', (req, res) => {
  // 如果有积压消息，直接返回
  if (messages.length > 0) {
    return res.json({
      messages: messages.splice(0)
    })
  }

  // 暂时没有消息，不立即响应
  const client: any = { res, timer: null }

  // 最多等待 30 秒
  client.timer = setTimeout(() => {
    finish(client, { messages: [] })
  }, TIMEOUT)

  clients.add(client)

  // 客户端断开连接时，清理等待请求
  res.on('close', () => {
    clearTimeout(client.timer)
    clients.delete(client)
  })
})

// 模拟产生新消息
app.post('/message', (req, res) => {
  const message = req.body.message || '收到一条新消息'

  if (clients.size === 0) {
    // 没有客户端正在等待，暂存消息
    messages.push(message)
  } else {
    // 将消息发送给所有正在等待的客户端
    for (const client of [...clients]) {
      finish(client, { messages: [message] })
    }
  }

  res.json({ success: true })
})

// 结束一次长轮询请求
function finish(client: any, data: any) {
  clearTimeout(client.timer)
  clients.delete(client)

  if (!client.res.writableEnded) {
    client.res.json(data)
  }
}

app.listen(PORT, () => {
  console.log(`服务器运行于 http://localhost:${PORT}`)
})
