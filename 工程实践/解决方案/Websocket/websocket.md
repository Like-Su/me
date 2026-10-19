# Websocket/ws

## HTTP 架构模式
1. 特点
- 半双工协议: 数据在同一时刻只能单向流动
- 服务器不能主动推送数据给浏览器

## 双向通信
1. Comet 用于 Web 推送技术, 能使服务器实时将数据推送给客户端, 无需客户端发送请求 目前三种方式实现
-  轮询(polling)
-  长轮询(long-polling)
-  iframe 流(streaming)
### 轮询
1. 实现方式: 客户端与服务器一直连接, 每个一段时间就询问一次
   1. 缺陷: 
      1. 用户越多服务端收到的并发请求会越多
      2. 每次都需要携带 HTTP Header 消耗流量与 CPU 利用率
2. 实现代码
- [Server](../../../code/工程实践/Websocket/1.query/app.mts)
- [Client](../../../code/工程实践/Websocket/1.query/index.html)
```js
setInterval(() => {
    let xhr = new XMLHttpRequest
    xhr.open('GET', '/clock', true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
      clock.innerHTML = xhr.responseText
    }
  }
  xhr.send()
}, 1000)
```

### 长轮询
1. 实现: 在请求完成后再次请求 而不是 等待 `N` 秒后请求(客户端发送给服务器后看看是否有新消息若没有则等待, 有新消息才会继续请求 减小带宽和CPU利用率), 保持链接
2. 实现代码
- [Server](../../../code/工程实践/Websocket/2.long-polling/app.mts)
- [Client](../../../code/工程实践/Websocket/2.long-polling/index.html)
```js
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
```
### ifream 流
1. 实现: 在HTML页面设置一个 `隐藏的ifream` 再将该 ifream src 属性设置为 长连接请求服务端即可推送数据
2. 代码实现:
- [前端实现](../../../code/工程实践/Websocket/3.ifream/index.html)
- [后端实现](../../../code/工程实践/Websocket/3.ifream/app.mts)

### EventSource
1. 实现: 服务端需要
2. 代码实现
- [前端实现](../../../code/工程实践/Websocket/4.eventSource/index.html)
- [后端实现](../../../code/工程实践/Websocket/4.eventSource/app.mts)


## Websocket

## Websocket 应用
