import path from 'node:path'
import fs from 'node:fs/promises'
import f from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import config from './fanyi.config.mts'

const model = new ChatOpenAI({
  apiKey: config.model.apiKey,
  model: config.model.modelName,
  configuration: config.model.baseURL
    ? { baseURL: config.model.baseURL }
    : undefined,
  temperature: config.model.temperature,
})

async function* transformer(
  source: string,
  target: string,
): AsyncGenerator<string> {
  const messages = [
    new SystemMessage(
      `${config.translation.systemPrompt}\n目标语言：${target}`,
    ),
    new HumanMessage(source),
  ]

  console.log('开始请求模型...')

  const stream = await model.stream(messages)
  let hasContent = false

  for await (const chunk of stream) {
    if (typeof chunk.content === 'string') {
      if (chunk.content.length > 0) {
        hasContent = true

        if (config.stream.logChunks) {
          console.log('收到文本片段:', chunk.content)
        }

        yield chunk.content
      }

      continue
    }

    for (const block of chunk.content) {
      if (
        typeof block === 'object' &&
        block !== null &&
        'text' in block &&
        typeof block.text === 'string'
      ) {
        hasContent = true

        if (config.stream.logChunks) {
          console.log('收到文本片段:', block.text)
        }

        yield block.text
      }
    }
  }

  if (!hasContent) {
    throw new Error('模型调用成功，但没有收到文本内容')
  }

  console.log('模型流读取完成')
}

async function main() {
  const file = process.argv[2] || config.files.source
  const language = process.argv[3] || config.translation.targetLanguage
  const targetFile = process.argv[4] || config.files.target

  const filePath = path.resolve(config.files.rootDir, file)
  const outputPath = path.resolve(config.files.rootDir, targetFile)

  const fileContent = await fs.readFile(
    filePath,
    config.files.encoding as BufferEncoding,
  )

  await pipeline(
    Readable.from(transformer(fileContent, language)),
    f.createWriteStream(outputPath, {
      encoding: config.files.encoding,
    }),
  )

  console.log('翻译完成:', outputPath)
}

main().catch((error) => {
  console.error('翻译失败:', error)
  process.exitCode = 1
})