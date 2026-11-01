function splitText(
  text: string,
  chunkSize = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  // 合法性验证
  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(overlap) ||
    chunkSize <= 0 ||
    overlap < 0 ||
    // 
    overlap >= chunkSize
  ) {
    throw new Error(
      'chunkSize 必须大于 0，且 0 <= overlap < chunkSize',
    )
  }

  // 将连续的空格压缩为 1 个空格
  // 这个切分器只是为了帮我们理解其中原理 若在生产环境 则会有 markdown/代码/表格 这样切分会破坏原有结构
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const chars = Array.from(normalized)
  const chunks: string[] = []
  const step = chunkSize - overlap

  for (let start = 0; start < chars.length; start += step) {
    const chunk = chars
      .slice(start, start + chunkSize)
      .join('')

    if (chunk) chunks.push(chunk)

    if (start + chunkSize >= chars.length) break
  }

  return chunks
}

console.log(splitText("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10, 3))
