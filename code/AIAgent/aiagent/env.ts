import 'dotenv/config'
export default {
  OPENAI_BASE_API: process.env.OPENAI_BASE_URL,
  OPENAI_KEY: process.env.OPENAI_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL
}