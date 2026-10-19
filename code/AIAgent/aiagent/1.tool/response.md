# 代码解读：`2.tool.mts`

这是一个基于 **LangChain + OpenAI** 的**工具调用（Tool Calling / Function Calling）Agent** 示例。核心流程是：**让模型自己决定调用工具 → 执行工具 → 把结果回传模型 → 模型基于结果生成最终回答**。

---

## 一、导入与初始化

```ts
import env from '../env.ts'
import { ChatOpenAI } from '@langchain/openai'
import { tool } from '@langchain/core/tools'
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import fs from 'node:fs/promises'
import { z } from 'zod'
import path from 'node:path'
```

- `env.ts`：集中管理环境变量（模型名、API Key、Base URL）。
- `ChatOpenAI`：LangChain 对 OpenAI 兼容接口的封装（这里通过 `baseURL` 指向了自定义网关，说明用的不是官方 OpenAI，而是兼容接口）。
- `tool`：把一个普通函数包装成「模型可调用的工具」。
- 消息类型：`SystemMessage`（系统提示）、`HumanMessage`（用户输入）、`AIMessage`（模型输出）、`ToolMessage`（工具执行结果回传）。
- `zod`：用来定义工具参数的 schema。

```ts
const model = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  apiKey: env.OPENAI_KEY,
  configuration: { baseURL: env.OPENAI_BASE_API },
  temperature: 0
})
```

- `temperature: 0`：让输出尽量确定性（不发散），适合工具调用这种要求稳定的场景。

---

## 二、定义工具

```ts
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
    return content
  },
  toolDescription.readFileTool
)

const tools = [readFileTool]
const modelWithTools = model.bindTools(tools)
```

要点：

1. **工具 = 函数 + 元数据（名称 / 描述 / 参数 schema）**。
   - `description` 和 `schema` 会被发送给模型，模型据此判断「什么时候该调这个工具、参数怎么填」。
2. 实际实现就是 `fs.readFile(filePath, 'utf-8')`，返回文件内容。
3. `model.bindTools(tools)`：把工具「挂载」到模型上，之后模型返回的 `AIMessage` 里就可能带有 `tool_calls`（即模型提出「我要调 read_file，参数是…」）。

---

## 三、构建消息

```ts
const messages = [
  new SystemMessage(`
    你是一个写代码助手, 用户要求你读取文件时候 你可以调用 read_file
    可用工具列表:
    read_file: 读取指定路径的文件内容
  `),
  new HumanMessage(`${path.join(path.resolve(import.meta.dirname), './2.tool.mts')} 代码并解释`)
]
```

- `SystemMessage`：给模型设定角色和工具使用说明。
- `HumanMessage`：用户请求「读取本文件并解释」。
  - `import.meta.dirname` 是**当前文件所在目录**，拼上 `./2.tool.mts` 得到本文件的绝对路径 —— 也就是**让这个程序去读它自己**。

---

## 四、第一次推理

```ts
let response = await modelWithTools.invoke(messages)
await fs.writeFile('./response-tool.json', JSON.stringify(response), 'utf-8')
```

- 调用模型。此时模型大概率不会直接给答案，而是返回一个带 `tool_calls` 的 `AIMessage`（内容是「我要调用 read_file」）。
- `writeFile('./response-tool.json', JSON.stringify(response))` 把这次原始响应落盘，方便调试查看调用结构。
  - ⚠️ 小问题：用了 `JSON.stringify(response)`，但 `AIMessage` 是类实例，直接序列化**会丢掉原型上的方法**，更好的做法是 `response.toJSON()`。

---

## 五、Agent 循环（核心）

代码里有两段循环，注释掉的那段是「串行顺序执行」版本，启用的那段是「并行执行」版本。

### 1）被注释的版本（教学版，顺序执行）

```ts
// while (response?.tool_calls && response?.tool_calls?.length > 0) {
//   const toolMessages = []
//   for (const call of response.tool_calls) {
//     const ret = await readFileTool.invoke(call)
//     toolMessages.push(new ToolMessage(ret, call.id!))
//   }
//   const updatedMessages = [...messages, response, ...toolMessages]
//   response = await modelWithTools.invoke(updatedMessages)
// }
```

逻辑清晰但有两个特点：
- 一个一个 `for` 循环调工具 → **串行**，多个工具会慢。
- 用 `updatedMessages` 新建数组，**没修改原 `messages`**，每轮都是拼 `messages + response + toolMessages`。
- 硬编码只用了 `readFileTool`，**没根据 `call.name` 查找工具**（只有单工具时没问题）。

### 2）实际启用的版本（并行 + 动态查工具）

```ts
while (response?.tool_calls && response?.tool_calls?.length > 0) {
  messages.push(response)
  console.log(`需要调用${response.tool_calls.length}个工具`)

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
    messages.push(new ToolMessage(toolRes[index], toolCall.id as string))
  })

  response = await modelWithTools.invoke(messages)
}
```

逐点解释：

| 代码 | 含义 |
|---|---|
| `while (response?.tool_calls?.length > 0)` | 只要模型还想调工具，就继续循环。这是 Agent 的「ReAct 循环」。 |
| `messages.push(response)` | 把模型的「工具调用请求」加入对话历史（关键：模型需要看到自己之前请求了什么）。 |
| `Promise.all(... map ...)` | **并行**执行所有工具调用（多个工具同时跑，比 for 循环快）。 |
| `tools.find(t => t.name === toolCall.name)` | **动态**根据模型给的工具名找到对应工具（可扩展多工具）。 |
| `if (!tool) return '没有找到合适工具...'` | 找不到工具时返回一段文本，而不是抛异常，保证流程不断。 |
| `try/catch` | 工具执行出错时返回 `错误: xxx`，同样作为工具结果回传，模型可以据此告知用户或重试。 |
| `new ToolMessage(toolRes[index], toolCall.id)` | 把结果包成 `ToolMessage`，**必须带上 `tool_call_id`**，才能和模型的请求一一对应。 |
| `response = await modelWithTools.invoke(messages)` | 把完整历史（含工具结果）再发给模型，模型据此产出最终自然语言回答。 |

循环退出条件：模型不再返回 `tool_calls`，即它认为信息够了，生成了最终回答。

---

## 六、输出结果

```ts
console.log(response.content)
await fs.writeFile(
  path.join(path.resolve(import.meta.dirname), './response.md'),
  response.content as string
)
```

- 打印最终回答。
- 并写入当前目录的 `response.md`。

---

## 七、整体数据流（时序）

```
SystemMessage + HumanMessage
        │
        ▼
  modelWithTools.invoke
        │
        ▼
  AIMessage(带 tool_calls: read_file)   ← 模型决定调工具
        │
   push 进 messages
        │
        ▼
  并行执行 read_file 工具（读本文件）
        │
        ▼
  ToolMessage(文件内容, id)   ← 结果回传
        │
   push 进 messages
        │
        ▼
  modelWithTools.invoke(完整历史)
        │
        ▼
  AIMessage(无 tool_calls，最终解释文本)
        │
        ▼
  console.log + 写 response.md
```

这是一种典型的**「模型决策 → 程序执行 → 结果反馈 → 模型总结」**的 Agent 范式。

---

## 八、值得注意的点 / 可改进处

1. **路径安全**：`read_file` 没有任何路径校验，模型可以要求读任意文件（安全风险）。可加白名单 / 目录限制。
2. **序列化**：`JSON.stringify(response)` 建议改成 `response.toJSON()`。
3. **输出路径不一致**：`response-tool.json` 用的是相对路径 `./`，而 `response.md` 用的是基于 `import.meta.dirname` 的绝对路径，写 `json` 时依赖**当前工作目录**，容易写错位置。
4. **类型标注**：`messages` 显式声明了联合类型数组；`toolRes` 是 `(string | ...)[]`，`ToolMessage` 的第一个参数类型需匹配 `string | ToolMessageContent` 等，某些版本可能要加类型断言。
5. **循环终止保护**：真实项目里最好加最大循环次数（如 `maxIterations`），防止模型反复调工具死循环。
6. **`content as string`**：模型 `content` 可能是数组（多模态时），强转 `string` 有隐患。
7. **工具错误处理**：当前把错误当普通结果返回，模型可能被「错误信息」误导，需要给出更严格的错误语义。

---

## 九、一句话总结

这是一个**最小可用的工具调用 Agent**：通过 `bindTools` 让模型自主决定调用 `read_file`，用 `while + Promise.all` 实现「并行执行工具 + 多轮循环」的 Agent 主循环，最终把模型对「读取自身代码」的解释输出到 `response.md`。它是理解 LangChain Agent 工具调用机制非常好的入门示例。