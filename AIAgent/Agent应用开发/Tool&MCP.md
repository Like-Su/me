# Tool & MCP

## Tool
我们在使用 Agent 时 读/写 文件/目录 与 执行命令 都是交给我们的 Tool

## MCP(Model Context Protocol) 模型上下文协议
> https://www.anthropic.com/news/model-context-protocol
> https://academy.claude.com/courses/building-with-the-claude-api/introducing-mcp
> https://academy.claude.com/zh-CN/courses
> https://academy.claude.com/zh-CN/all
> JSON-RPC: https://www.jsonrpc.org/specification
> https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index

MCP 提供标准化的工具 用于连接 LLM 和 数据源, 将分散化转变为集中化管理(开发者用同一种方式 将 数据源,工具,功能 连接到 AI 模型中)

### MCP 三个核心组件
MCP 架构核心组件
1. MCP Host: MCP 应用程序(ChatGPT Desktop 等 AI 应用工具)
2. MCP Clients: 协议客户端(与服务器一对一连接,负责请求和接收响应)
3. MCP Servers: 通过 MCP 暴露特定功能(系统常用功能调用 与 API 调用)

MCP Clients 和 MCP Servers 交互必须遵守如下数据格式 和 类型限制: [JSON-RPC2.0](http s://www.jsonrpc.org/specification#overview)
```ts
// 请求
{
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  parrams?: {
    [key: string]: unknown;
  }
}

// 响应 与 错误
{
  jsonrpc: "2.0";
  id: string | number;
  result?: {
    [key: string]: unknown;
  },
  error?: {
    code: number;
    message: string;
    data: unknown;
  }
}

// 通知(Client -> Server, Server -> Client)
{
  jsonrpc: "2.0";
  method: string;
  parrams?: {
    [key: string]: unknown;
  }
}

// 批处理(批量处理多个请求和通知 方法)
Array<{
  jsonrpc: "2.0",
  id: string | number;
  method: string;
  params?: {
    [key: string]: unknowng;
  }
}>;
```

### MCP 与 Tool Calls 区别
ToolCalls 是一种机制, 告诉 LLM 有哪些工具可用, LLM 根据用户需求来决定调用哪些工具, 但是 LLM 并不具备直接调用工具能力 这就需要依靠 本地代码或 MCP Host 通过 MCP Client 和 MCP Server 交互来完成实际调用. 即使没有 MCP 也可以调用工具 但是这样我们就需要将所有工具都实现一遍, 这就非常麻烦且冗余了


### MCP 生命周期
主要分为三个阶段: 初始化, 操作, 关闭
- 初始化: 协商协议版本, 初始化会话id
- 操作: 获取工具列表, 调用指定工具
- 关闭: 连接终止

### MCP 传输机制
1. 标准输入输出(Stdio): 操作系统提供(适合本地小工具集成, 处理个人数据, 快速做功能与Demo)
2. 可流式HTTP(Streamable-HTTP): 基于 HTTP 协议传输(允许数据以流形式在Client和Server传输) 无需一次加载完毕数据 适合 生产环境, 分布式系统, 无状态服务架构