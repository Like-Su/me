import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { SourceMapConsumer } from 'source-map'

// sourcemap 缓存
const sourceMapCache = new Map<string, SourceMapConsumer>()


// 将错误格式重写一下
Error.prepareStackTrace = (
  error: Error,
  stack: NodeJS.CallSite[]
) => {

  const { name = 'CustomError', message = 'Custom Error Messages' } = error
  const errorMessage = `${name}: ${message}`
  const processStack = []

  // 从后面开始遍历
  for (let i = stack.length - 1; i >= 0; i--) {
    processStack.push(`\n custom at ${wrapCallSite(stack[i])}`)
  }

  return `${errorMessage}${processStack.reverse().join('')}`
}
// 替换 错误信息
function wrapCallSite(frame: NodeJS.CallSite) {
  const source = frame.getFileName()

  if (source) {

    let position: Record<string, any> = {
      source,
      line: frame.getLineNumber(),
      column: frame.getColumnNumber()
    }

    const result = mapSourcePosition(
      position.source,
      position.line,
      position.column
    )

    if (result) {
      position = result
    }


    const newFrame: Record<string, any> = {}

    newFrame.getFunctionName = () => frame.getFunctionName()
    newFrame.getFileName = () => position.source
    newFrame.getLineNumber = () => position.line
    newFrame.getColumnNumber = () => position.column

    newFrame.toString = function () {
      return `function is ${this.getFunctionName()} (${this.getFileName()}:${this.getLineNumber()}:${this.getColumnNumber()})`
    }
    return newFrame
  }
  return frame
}



// 读取 sourceMap 路径
function retrieveSourceMapURL(source: string) {
  const fileContent = fs.readFileSync(source, {
    encoding: 'utf-8'
  })
  const regexp = /\/\/# sourceMappingURL=(.+)$/gm
  let lastMatch
  let match
  while (match = regexp.exec(fileContent)) {
    lastMatch = match
  }
  if (!lastMatch) return null
  return lastMatch[1]
}



// 获取 sourcemap consumer
function getSourceMapConsumer(source: string) {
  if (sourceMapCache.has(source)) {
    return sourceMapCache.get(source)
  }
  const sourceMapURL = retrieveSourceMapURL(source)
  if (!sourceMapURL) return null
  const sourceMapPath = path.join(
    path.dirname(source),
    sourceMapURL
  )
  if (!fs.existsSync(sourceMapPath)) return null
  const mapContent = fs.readFileSync(
    sourceMapPath,
    'utf-8'
  )
  const consumer = new SourceMapConsumer(mapContent as any)
  sourceMapCache.set(source, consumer)

  return consumer
}



// 映射源码位置
function mapSourcePosition(
  source: string,
  line: number | null,
  column: number | null
) {
  // file:///D:/Project/me/code/index.js => D:\Project\me\code\index.js
  if (source.startsWith('file://')) {
    source = fileURLToPath(source)
  }

  if (!fs.existsSync(source)) return null

  const consumer = getSourceMapConsumer(source)

  if (!consumer) return null


  const position = consumer.originalPositionFor({
    line: line ?? 0,
    column: column ?? 0
  })


  if (!position.source) return null


  return {
    source: path.resolve(
      path.dirname(source),
      position.source
    ),
    line: position.line,
    column: position.column
  }
}



function main() {
  const error = new Error('a')
  throw error
}

main()