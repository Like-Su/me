import 'dotenv/config'
import express from 'express'

// SSE 根据标准来说 只支持 HTTP GET, 并且不能发送自定义 Header, 我们通过 API Key 调用 就需要支持 Authorization Header 所以必须使用 POST, 这不意味前端不能使用 SSE 处理流输出, 而是需要创建一个 BFF 层 通过 NodeServer 来中转
// SSE 适合长时间保持连接的应用场景(此外 还支持 lastEventId 来进行数据续传, 大大节省数据传输带宽和接收响应时间)


const BASE_URL = process.env.OPENAI_BASE_URL
const KEY = process.env.OPENAI_KEY
const app = express()
const port = 3000

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  // 预检请求直接返回
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})


app.get('/stream', async (req, res) => {
  // 设置头部
  res.setHeader('Content-Type', 'text/event-stream; charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders() // 发送初始响应头

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: req.query.question }],
        stream: true
      })
    })
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to fetch from OPENAI')
    }

    const reader = response.body?.getReader()
    const decode = new TextDecoder()
    let done = false
    let buffer = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = buffer + decode.decode(value, { stream: true })
      buffer = ''
      const lines = chunkValue.split('\n').filter(line => line.trim() && line.startsWith('data: '));
      for (const line of lines) {
        const incoming = line.slice(6)
        if (incoming === '[DONE]') {
          done = true
          break
        }
        try {
          const data = JSON.parse(incoming)
          const delta = data.choices[0].delta.content
          if (delta) res.write(`data: ${delta}\n\n`)
        } catch (e) {
          buffer += incoming
        }
      }
    }
  } catch (e) {
    console.error('Error fetching from OpenAI:', e)
    res.write('data: Error fetching from OpenAI\n\n');
    res.end();
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})