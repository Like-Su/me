# AIAgent 开发
AI 时代 语言视乎不再是特别重要的东西, 重要的是 你的思维, 工程业务能力, 基础 以及 技术场景问题 也就是 在一个场景下你遇到的问题 你是否有 解决问题的能力.

我们现在每天都用着各种 AIAgent 产品, 微信 公众号也内置 AI 助手帮助你快速理解文章内容

但是 Agent 应用开发 会遇到哪些问题呢?
- 记忆(长短期记忆)
- 工具调用(想要访问其他网页, 调用 API 等)
- 私有部署

LLM 如何发展 都需要考虑 Memory 管理, 工具调用, RAG 这些问题, 我们日常使用的 ClaudeCode/Codex/Cursor 等 AI 工具 其实就是 使用 Tool 来扩展自己的能力 让其拥有 读取文件/修改文件/创建文件 等等 诸多权限, 以及我们用到软件内置的 AI 也都是支持 Tool 的

LLM 和 Agent 区别:
- LLM: 大语言模型, 只能回答问题其中过程是 (input -> process -> output), 主要职责是 理解推理生成
- Agent: 就是 LLM + Tool + Memory 给 大语言模型增加思考规划执行能力 即可自动完成事情

在Agent应用开发 我们会从 Tool/MCP/Skill 这些讲起来, 在讲讲 RAG/LangChain/LangGraph/Memory 评测 篇, 最后我们来看看 LLM 原理

LangChain 主要是掌握 ChatModel/ToolCall/MCP/RAG/Memory/StructuredOutput/Prompt/Template 等组件 以及 Chain(链式流程)/LCEL(声明式语法) 等语法

LangGraph(Agent 图编排引擎) 在 LangChain 基础上增加 图编排能力(State 状态, 节点, 检查便 Checkpoint) 通过改图模型可以实现 循环,分支,并行执行, 多 Agent, 会话中断恢复等复杂功能

DeepAgents 是基于 LangGraph 为基础封装的 内置 任务规划, 多 Agent, Skill 现成能力 开箱即用

Agent 全链路检测方案: LangSmith, LangFuse 等记录 Agent 完成运行链路
  - 示例: 用户输出 -> 大模型调用 -> token 消耗/报错/工具调用...
  - 问题: 死循环/参数错误/响应慢

Transformer: 架构, 单双向注意力, 训练, 推理阶段, 自回归生成

AI 都是在后端运行 所以我们需要有后端基础, 在补充一下(Milvus 等向量数据库知识)
```txt
// 基础技能
数据库: Mysql/PostgresSQL/ElasticSearch/Redis/Neo4j
OSS: Minio/RustFS
消息队列: RabbitMQ
后端: 任意语言基础(JS/Python/Java/Go/Rust) + 对应语言的框架
部署: Docker
```