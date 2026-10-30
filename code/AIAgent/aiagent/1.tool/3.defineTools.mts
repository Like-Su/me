import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'


// 实现简单的 CRUD 文件的 tool
const ToolName = {
  ReadFile: 'ReadFile',
  WriteFile: 'WriteFile',
  DeleteFile: 'DeleteFile',
  ListDirectory: 'ListDirectory',
  ExecuteCommand: 'ExecuteCommand',
  CallApi: 'CallApi',
} as const

type ToolVal = {
  name: string;
  description: string;
  schema: z.ZodType,
  tool: (args: any) => Promise<unknown>
}

export const Tools: Record<string, ToolVal> = {}


function defineTool<T extends z.ZodType>(toolName: keyof typeof ToolName, tool: { description: string; schema: T; tool: (args: z.infer<T>) => Promise<unknown> }) {
  Tools[toolName] = {
    name: toolName,
    ...tool
  }
}


const execFileAsync = promisify(execFile)
const ROOT = process.env.AGENT_WORKSPACE
  ? path.resolve(process.env.AGENT_WORKSPACE)
  : import.meta.dirname

export const System = (await fs.readFile(resolvePath(await safePath('system.md')), 'utf-8'))

function resolvePath(filePath: string) {
  const target = path.resolve(ROOT, filePath)
  const relative = path.relative(ROOT, target)
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('禁止访问工作目录以外的路径')
  return target
}

async function safePath(filePath: string) {
  const target = resolvePath(filePath)
  const relative = path.relative(ROOT, target)
  const parts = relative ? relative.split(path.sep) : []
  let current = ROOT
  for (const part of parts) {
    current = path.join(current, part)
    try {
      const stat = await fs.lstat(current)

      if (stat.isSymbolicLink()) {
        throw new Error('禁止通过符号链接访问文件')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') break
      throw error
    }
  }

  return target
}


defineTool(ToolName.ReadFile, {
  description: '读取指定路径的文件内容',
  schema: z.object({
    filePath: z.string().min(1).describe('读取的文件路径')
  }),
  tool: async ({ filePath }: any) => {
    const target = await safePath(filePath)
    const content = await fs.readFile(target, 'utf-8')
    return {
      filePath,
      content
    }
  }
})


defineTool(ToolName.WriteFile, {
  description: '创建文件或者修改已有文件',

  schema: z.object({
    filePath: z.string().min(1).describe('文件路径'),
    content: z.string().describe('文件内容'),
    overwrite: z.boolean().default(false),
  }),

  tool: async ({ filePath, content, overwrite }) => {
    const target = await safePath(filePath)

    await fs.mkdir(path.dirname(target), {
      recursive: true,
    })

    await fs.writeFile(target, content, {
      encoding: 'utf8',
      flag: overwrite ? 'w' : 'wx',
    })

    return {
      success: true,
      message: '文件写入成功',
      filePath,
    }
  },
})

defineTool(ToolName.DeleteFile, {
  description: '删除指定文件',

  schema: z.object({
    filePath: z.string().min(1).describe('删除的文件路径'),
  }),

  tool: async ({ filePath }) => {
    if (process.env.ALLOW_AGENT_DELETE !== 'true') {
      throw new Error('文件删除功能未启用')
    }

    const target = await safePath(filePath)

    await fs.unlink(target)

    return {
      success: true,
      message: '文件删除成功',
      filePath,
    }
  },
})

defineTool(ToolName.ListDirectory, {
  description: '获取指定目录中的文件和子目录',

  schema: z.object({
    dirPath: z.string().default('.'),
  }),

  tool: async ({ dirPath }) => {
    const target = await safePath(dirPath)

    const entries = await fs.readdir(target, {
      withFileTypes: true,
    })

    return entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory()
        ? 'directory'
        : entry.isFile()
          ? 'file'
          : 'other',
    }))
  },
})

const ALLOWED_COMMANDS: Record<string, string[]> = {
  node: ['--version', '-v'],
  npm: ['--version', '-v'],
  pnpm: ['--version', '-v'],
  git: ['status', 'log', 'diff'],
}

defineTool(ToolName.ExecuteCommand, {
  description: '执行允许列表中的终端命令',

  schema: z.object({
    command: z.string().min(1).describe('命令名称'),
    args: z.array(z.string()).default([]),
    cwd: z.string().default('.'),
  }),

  tool: async ({ command, args, cwd }) => {
    if (process.env.ALLOW_AGENT_COMMANDS !== 'true') {
      throw new Error('命令执行功能未启用')
    }

    const allowed = ALLOWED_COMMANDS[command]

    if (!allowed || !allowed.includes(args[0])) {
      throw new Error(`不允许执行命令: ${command}`)
    }

    // 禁止额外参数，避免通过选项绕过限制
    if (
      args.length !== 1 &&
      !(command === 'git' && args.length === 0)
    ) {
      throw new Error('当前命令不支持额外参数')
    }

    const directory = await safePath(cwd)

    const { stdout, stderr } = await execFileAsync(
      command,
      args,
      {
        cwd: directory,
        timeout: 10000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      }
    )

    return {
      stdout,
      stderr,
    }
  },
})

defineTool(ToolName.CallApi, {
  description: '发送 HTTP 请求并获取 API 响应',

  schema: z.object({
    url: z.url().describe('API 地址'),

    method: z.enum([
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ]).default('GET'),

    headers: z.record(
      z.string(),
      z.string()
    ).default({}),

    body: z.unknown().optional(),
  }),

  tool: async ({ url, method, headers, body }) => {
    const target = new URL(url)

    // 只允许访问配置中的 HTTPS 主机
    const allowedHosts = new Set(
      (process.env.ALLOWED_API_HOSTS ?? 'api.github.com')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean)
    )

    if (
      target.protocol !== 'https:' ||
      !allowedHosts.has(target.hostname)
    ) {
      throw new Error('不允许访问该 API 地址')
    }

    // 默认仅允许 GET 请求
    if (
      method !== 'GET' &&
      process.env.ALLOW_AGENT_API_WRITE !== 'true'
    ) {
      throw new Error('API 写操作未启用')
    }

    const response = await fetch(target, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
        ...(body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })

    const text = await response.text()

    let data: unknown = text

    try {
      data = JSON.parse(text)
    } catch {
      // 非 JSON 响应直接返回文本
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
    }
  },
})