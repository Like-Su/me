
import { readFile } from 'node:fs/promises'
import { posix } from 'node:path'

import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { convert } from 'html-to-text'

export interface EpubChapter {
  chapter: string
  chapterIndex: number
  content: string
  locator: string
}

export interface EpubBook {
  title: string
  author: string
  chapters: EpubChapter[]
}

type XmlObject = Record<string, unknown>

function asObject(value: unknown): XmlObject {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as XmlObject
  }

  return {}
}

function asArray(value: unknown): unknown[] {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function attribute(node: unknown, name: string): string {
  const obj = asObject(node)
  return String(obj[`@_${name}`] ?? '')
}

function xmlText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)

  if (Array.isArray(value)) {
    return value.map(xmlText).filter(Boolean).join(' ')
  }

  const obj = asObject(value)

  return xmlText(
    obj['#text'] ?? obj['_'] ?? ''
  )
}

function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlToText(html: string): string {
  return normalizeText(
    convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' },
        { selector: 'nav', format: 'skip' },
      ],
    })
  )
}

function extractChapterTitle(
  html: string,
  fallback: string,
): string {
  const match =
    html.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i) ??
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)

  if (!match) return fallback

  const title = htmlToText(match[1])
    .replace(/\s+/g, ' ')
    .trim()

  return title || fallback
}

function resolveEpubPath(
  opfPath: string,
  href: string,
): string {
  const withoutFragment = href.split('#')[0].split('?')[0]

  let decoded = withoutFragment

  try {
    decoded = decodeURIComponent(withoutFragment)
  } catch {
    // 非法 URI 编码时保留原始路径
  }

  const normalized = posix.normalize(
    posix.join(
      posix.dirname(opfPath),
      decoded.replace(/\\/g, '/'),
    )
  )

  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.startsWith('/')
  ) {
    throw new Error(`非法 EPUB 内部路径：${href}`)
  }

  return normalized
}

export async function parseEpub(
  filePath: string,
): Promise<EpubBook> {
  const buffer = await readFile(filePath)
  const zip = await JSZip.loadAsync(buffer)

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
  })

  async function readZip(path: string): Promise<string> {
    const entry = zip.file(path)

    if (!entry) {
      throw new Error(`EPUB 缺少文件：${path}`)
    }

    return entry.async('string')
  }

  // 1. container.xml -> OPF
  const containerXml = await readZip(
    'META-INF/container.xml'
  )

  const container = asObject(
    parser.parse(containerXml)
  )

  const rootfiles = asObject(
    asObject(container.container).rootfiles
  )

  const rootfile = asArray(rootfiles.rootfile)[0]

  const opfPath = attribute(
    rootfile,
    'full-path',
  )

  if (!opfPath) {
    throw new Error('EPUB 未找到 OPF 文件')
  }

  // 2. 解析 OPF
  const opfXml = await readZip(opfPath)

  const opf = asObject(
    parser.parse(opfXml)
  )

  const packageNode = asObject(opf.package)
  const metadata = asObject(packageNode.metadata)

  const title =
    xmlText(asArray(metadata.title)[0]) ||
    '未知书名'

  const author =
    xmlText(asArray(metadata.creator)[0]) ||
    '未知作者'

  // 3. Manifest -> Map<资源ID, 资源>
  const manifest = asObject(packageNode.manifest)
  const items = asArray(manifest.item)

  const resources = new Map<string, XmlObject>()

  for (const item of items) {
    const id = attribute(item, 'id')

    if (id) {
      resources.set(id, asObject(item))
    }
  }

  // 4. Spine -> 阅读顺序
  const spine = asObject(packageNode.spine)
  const spineItems = asArray(spine.itemref)

  if (!spineItems.length) {
    throw new Error('EPUB 没有有效的 Spine 阅读顺序')
  }

  const chapters: EpubChapter[] = []

  // 5. 按阅读顺序解析 XHTML
  for (const [index, itemref] of spineItems.entries()) {
    const idref = attribute(itemref, 'idref')
    const resource = resources.get(idref)

    if (!resource) continue

    const href = attribute(resource, 'href')
    const mediaType = attribute(resource, 'media-type')
    const properties = attribute(resource, 'properties')

    if (!href) continue

    if (properties.split(/\s+/).includes('nav')) {
      continue
    }

    if (
      mediaType !== 'application/xhtml+xml' &&
      mediaType !== 'text/html'
    ) {
      continue
    }

    const internalPath = resolveEpubPath(
      opfPath,
      href,
    )

    const entry = zip.file(internalPath)

    if (!entry) {
      console.warn(`EPUB 跳过不存在的章节：${internalPath}`)
      continue
    }

    const html = await entry.async('string')
    const content = htmlToText(html)

    if (!content) continue

    const chapter = extractChapterTitle(
      html,
      `第 ${index + 1} 节`,
    )

    chapters.push({
      chapter,
      chapterIndex: chapters.length,
      content,
      locator: internalPath,
    })
  }

  if (chapters.length === 0) {
    throw new Error('EPUB 没有提取到有效正文')
  }

  return {
    title,
    author,
    chapters,
  }
}
