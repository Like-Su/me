import net from 'node:net'
import crypto from 'node:crypto'

const HEADERS = {
  SEC_WEBSOCKET_VERSION: 'Sec-WebSocket-Version',
  SEC_WEBSOCKET_KEY: 'Sec-WebSocket-Key',
  SEC_WEBSOCKET_ACCEPT: 'Sec-WebSocket-Accept',
}

function composeHeaders(data: string) {
  const line = data.split('\r\n')
  const row = line.slice(1, -2)
  let headers = row.reduce((memo, item) => {
    let [key, value] = item.split(': ')
    memo[key] = value
    return memo
  }, {} as any)
  // console.log(headers)
  return headers
}

function computedAcceptKey(key: string) {
  // let key = 'Sec-WebSocket-Key: nfdQ7QugOI+gx6YiZ3PIYA=='
  let acceptBefore = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  let accept = crypto.createHash('sha1').update(key + acceptBefore).digest('base64')
  return accept
}

function unmask(payload: any, mask: any) {
  for (let i = 0; i < payload.length; i++) {
    payload[i] ^= mask[i % 4]
  }

}

const server = net.createServer((socket) => {
  // 继承 EventEmitter
  socket.once('data', (data) => {
    data = data.toString('utf-8')
    // 包装请求头
    if (data.match(/Connection: Upgrade/g)) {
      // 获取 请求头
      const headers = composeHeaders(data)
      // console.log(headers);

      if (headers[HEADERS.SEC_WEBSOCKET_VERSION] === '13') {
        let secWebsocketKey = headers[HEADERS.SEC_WEBSOCKET_KEY]
        // 计算 accept
        let secWebsocketAccept = computedAcceptKey(secWebsocketKey)
        let response = [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `${HEADERS.SEC_WEBSOCKET_ACCEPT}: ${secWebsocketAccept}`,
          '\r\n'
        ].join('\r\n')
        socket.write(response)
        // 后续所有格式都是 基于 websocket 格式(开始传输数据)
        socket.on('data', (buffers: any) => {
          // 结束位: 开头是 0 还是 1
          let fin = (buffers[0] & 0b10000000) === 0b10000000
          // 操作码
          let opcode = buffers[0] & 0b00001111
          // 是否进行掩码
          let isMask = (buffers[1] & 0b10000000) === 0b10000000
          let payloadLength = buffers[1] & 0b01111111
          // 携带的数据
          let payload;
          if (payloadLength <= 125) {
            if (isMask) {
              // 去除 2 ~ 5 字节 掩码键
              let mask = buffers.slice(2, 6)
              payload = buffers.slice(6)
              // 对数据进行 反掩码(还原为原始数据)
              unmask(payload, mask)
            } else {
              payload = buffers.slice(2)
            }
          } else if (payloadLength <= 126) {
            payloadLength = buffers.slice(2, 4)
          }

          console.log(payload.toString())

          let response = Buffer.alloc(2 + payload.length)
          response[0] = 0b10000000 | opcode
          response[1] = payloadLength
          // 第二个数据开始拷贝
          payload.copy(response, 2)
          console.log(response);

          socket.write(response)
        })
      }

    }
  })
  socket.on('close', () => {

  })
})

server.listen(8888)