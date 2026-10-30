import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

const client = new Client({
  name: 'my-agent',
  version: '1.0.0'
})

// 与 该 MCP 服务进行通信
const transport = new StdioClientTransport({
  // 通过 node 调用
  command: 'node',
  args: ['./mcp-server.mts'],
})

await client.connect(transport)

try {
  const { tools } = await client.listTools()
  console.log('可用工具', tools)
  const ret = await client.callTool({
    name: 'add',
    arguments: {
      a: 10,
      b: 20
    }
  })
  console.log('执行结果:', ret.content)
} finally {
  await client.close()
}