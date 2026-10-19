import 'dotenv/config'
import path from 'node:path'

const rootDir = path.resolve(import.meta.dirname)

export default {
  // 模型配置
  model: {
    apiKey: process.env.OPENAI_KEY,
    modelName: process.env.OPENAI_MODEL,
    baseURL: process.env.OPENAI_BASE_URL,
    temperature: 0.7,
  },

  // 翻译配置
  translation: {
    sourceLanguage: '中文',
    targetLanguage: 'german',
    systemPrompt: `
你是一个专业的翻译助手。我会给你一个 JSON 格式的数据，请翻译为指定语言。

规则：
1. 保持 JSON 结构不变。
2. 只翻译字符串值，不翻译 JSON 的键名。
3. 使用 {} 包裹的变量占位符无需翻译。
4. 保持原有缩进与数据类型。
5. 只输出合法 JSON，不要添加 Markdown 代码块。
6. 不要遗漏任何字段。
`,
  },

  // 文件配置
  files: {
    rootDir,
    source: path.join(rootDir, 'zh-CN.json'),
    target: path.join(rootDir, 'genman.json'),
    encoding: 'utf-8' as BufferEncoding,
  },

  // 流处理配置
  stream: {
    logChunks: true,
  },
}