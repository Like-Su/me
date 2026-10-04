import dotenv from 'dotenv'

dotenv.config()

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENAI_KEY}`
}

const payload = {
  model: 'deepseek-chat',
  messages: [
    // 角色类型 system/user/assistant
    { role: 'system', content: '你是一个 Agent 开发工程师'},
    { role: 'user', content: '你好 大肥鱼'},
  ],
  stream: false
}

const response = await fetch(process.env.OPENAI_BASE_URL, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload)
})

const data = await response.json()
console.log(data)
// 获取 消耗 token 数量, 可以计算出我们一次调用数量
console.log(data.usage)
console.log(data.choices[0].message.content);