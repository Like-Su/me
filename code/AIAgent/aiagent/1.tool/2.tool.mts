import env from '../env.ts'
import { ChatOpenAI } from '@langchain/openai'
// 工具定义
import { tool } from '@langchain/core/tools'
// 消息类型定义
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import fs from 'node:fs/promises'
import { z } from 'zod'
import path from 'node:path'

const model = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  apiKey: env.OPENAI_KEY,
  configuration: {
    baseURL: env.OPENAI_BASE_API
  },
  temperature: 0
})

// 工具描述
const toolDescription = {
  readFileTool: {
    name: 'read_file',
    description: '读取指定路径的文件内容',

    schema: z.object({
      filePath: z.string().describe('要读取的文件路径')
    })
  }
}

const readFileTool = tool(
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8')
    // console.log('文件内容: ', content)
    // 将结果返回给工具
    return content
  },
  toolDescription.readFileTool
)

const tools = [readFileTool]

// 绑定工具
const modelWithTools = model.bindTools(tools)

// 构建消息
const messages: (AIMessage | SystemMessage | HumanMessage | ToolMessage)[] = [
  // 系统提示词(AI 可以做什么与能力)
  new SystemMessage(`
    你是一个写代码助手, 用户要求你读取文件时候 你可以调用 read_file
    可用工具列表:
    read_file: 读取指定路径的文件内容
  `),
  // 用户提供的信息
  new HumanMessage(`${path.join(path.resolve(import.meta.dirname), './2.tool.mts')} 代码并解释`)
]


let response = await modelWithTools.invoke(messages)
// 加入聊天历史

await fs.writeFile('./response-tool.json', JSON.stringify(response), 'utf-8')


// while (response?.tool_calls && response?.tool_calls?.length > 0) {
//   console.log(`需要调用${response.tool_calls.length}个工具`);
//   const toolMessages = []
//   for (const call of response.tool_calls) {
//     const ret = await readFileTool.invoke(call)
//     // console.log(ret)
//     toolMessages.push(
//       new ToolMessage(ret, call.id!)
//     )
//   }
//   const updatedMessages = [
//     ...messages,
//     response,
//     ...toolMessages
//   ]
//   response = await modelWithTools.invoke(updatedMessages)
// }

while (response?.tool_calls && response?.tool_calls?.length > 0) {
  messages.push(response)
  console.log(`需要调用${response.tool_calls.length}个工具`);
  const toolRes = await Promise.all(
    response.tool_calls.map(async toolCall => {
      const tool = tools.find(tool => tool.name === toolCall.name)
      if (!tool) return `没有找到合适工具 ${toolCall.name}\n`
      console.log(`${toolCall.name}工具执行`)
      try {
        const res = await tool.invoke(toolCall)
        return res
      } catch (e) {
        return `错误: ${(e as any).message}`
      }
    })
  )

  response.tool_calls.forEach((toolCall, index) => {
    messages.push(
      new ToolMessage(toolRes[index], toolCall.id as string)
    )
  })

  response = await modelWithTools.invoke(messages)
}

console.log(response.content)
await fs.writeFile(`${path.join(path.resolve(import.meta.dirname), './response.md')}`, response.content as string)
