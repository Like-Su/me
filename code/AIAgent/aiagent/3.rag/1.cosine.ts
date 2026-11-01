function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) {
    throw new Error('向量维度不一致')
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] ** 2
    normB += b[i] ** 2
  }

  if (normA === 0 || normB === 0) {
    throw new Error('不能计算零向量的余弦相似度')
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

const a = [0.92, 0.82, 0.13]
const b = [0.89, 0.84, 0.16]
const c = [0.12, 0.21, 0.94]

console.log(cosineSimilarity(a, b)) // 0.999289020801166
console.log(cosineSimilarity(a, c)) // 0.3365416423575587
console.log(cosineSimilarity(b, c)) // 0.3619495579759933