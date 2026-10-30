import { MCPAdapter } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import {
  HumanMessage,
  ToolMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import env from '../env.ts'
import { Tools, System } from './3.defineTools.mts'


const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  apiKey: process.env.OPENAI_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
})


const adapter = new MCPAdapter({
  servers: {
    docs: {
      url: 'https://docs.langchain.com/mcp',
    },
  },
})

// 将自定义 ToolVal 转换为 LangChain Tool
const toolsSet = Object.values(Tools).map((item) => {
  return tool(
    async (args) => {
      const result = await item.tool(args)

      // 将工具结果转换为文本
      return typeof result === 'string'
        ? result
        : JSON.stringify(result, (_, value) =>
          typeof value === 'bigint'
            ? value.toString()
            : value
        )
    },
    {
      name: item.name,
      description: item.description,
      schema: item.schema,
    }
  )
})


async function runAgentWithTools(
  query: string,
  maxIterations = 30,
  modelWithTools: any
) {
  // 消息列表
  const messages: BaseMessage[] = [
    new SystemMessage(System),
    new HumanMessage(query),
  ]

  for (let i = 0; i < maxIterations; i++) {
    console.log(`\n========== 第 ${i + 1} 轮 ==========`)

    // 1. 调用大模型
    const response = await modelWithTools.invoke(messages)

    // 2. 保存 AIMessage
    messages.push(response)

    const toolCalls = response.tool_calls ?? []
    console.log('toolCalls', toolCalls)

    // 3. 没有工具调用，表示模型完成回答
    if (toolCalls.length === 0) {
      console.log('AI 最终回复:', response.content)
      return response.content
    }

    // 4. 执行模型请求的工具
    for (const toolCall of toolCalls) {
      console.log('工具名称:', toolCall.name)
      console.log('工具参数:', toolCall.args)

      const foundTool = toolsSet.find(
        (item) => item.name === toolCall.name
      )

      if (!toolCall.id) {
        throw new Error(
          `工具 ${toolCall.name} 缺少 tool_call_id`
        )
      }

      let content: string | any
      let isError = false

      try {
        if (!foundTool) {
          throw new Error(`工具不存在: ${toolCall.name}`)
        }

        // 真正执行工具
        content = await foundTool.invoke(toolCall.args)

        console.log('工具结果:', content)
      } catch (error) {
        isError = true

        content = error instanceof Error
          ? error.message
          : String(error)

        console.error('工具执行失败:', content)
      }

      // 5. 封装 ToolMessage
      messages.push(
        new ToolMessage({
          content,
          tool_call_id: toolCall.id,
          status: isError ? 'error' : 'success',
        })
      )
    }

    // 6. 继续循环，让模型处理工具结果
  }

  throw new Error(
    `Agent 已达到最大迭代次数: ${maxIterations}`
  )
}

try {
  // 获取 MCP 工具并转换为 LangChain Tool
  const mcpTools = await adapter.listTools()
  const allTools = [...toolsSet, ...mcpTools]

  // 绑定
  const modelWithTools = model.bindTools(allTools)

  // 后续仍使用你原来的 Agent Loop
  // Agent Loop
  const ret = await runAgentWithTools('你现在能做什么呢?', 30, modelWithTools)
  console.log(ret)
} finally {
  await adapter.close()
}