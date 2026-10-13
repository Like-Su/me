const http = require('node:http')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({
    data: 'Hello World!'
  }))
})

server.listen(8888)