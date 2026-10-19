import env from '../env.ts'
import { ChatOpenAI } from '@langchain/openai'

const model = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  apiKey: env.OPENAI_KEY,
  configuration: {
    baseURL: env.OPENAI_BASE_API
  }
})

const response = await model.invoke('hello')
console.log(response.content);
