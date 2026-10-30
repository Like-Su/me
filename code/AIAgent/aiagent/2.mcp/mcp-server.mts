import { McpServer } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { z } from 'zod'


// 通过 Stdio 进行通信
serveStdio(() => {
  // 创建服务端
  const server = new McpServer({
    name: 'my-tool',
    version: '1.0.0'
  })

  // 注册工具
  server.registerTool(
    'add',
    {
      description: '计算两个数字之和',
      inputSchema: z.object({
        a: z.number(),
        b: z.number(),
      }),
    },
    async ({ a, b }: any) => {
      return { content: [{ type: 'text', text: String(a + b) }] }
    }
  )

  return server
})