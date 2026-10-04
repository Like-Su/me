import 'dotenv/config'
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENAI_KEY}`
}


let question = '讲一下中华传说'
let content = ''
let stream = true

const update = async () => {
  if(!question) return
  content = '思考中...'

  const response = await fetch(process.env.OPENAI_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: question
        },
      ],
      // 将流式开始
      stream
    })
  })

  if(stream) {
    content = ''
    // 获取 读取器
    const reader = response.body?.getReader()
    // 对二进制数据进行解码
    const decoder = new TextDecoder()
    let done = false
    let buffer = ''
    while(!done) {
      const { value, done: doneReading } = await reader?.read()
      done = doneReading
      const chunkValue = buffer + decoder.decode(value)
      buffer = ''

      const lines = chunkValue.split('\n').filter((line) => line.startsWith('data: '))

      for(const line of lines) {
        const incoming = line.slice(6)
        // 表示结束
        if(incoming === '[DONE]') {
          done = true
          break
        }
        try {
          const data = JSON.parse(incoming)
          const delta = data.choices[0].delta.content
          if(delta) content += delta
          delta && process.stdout.write(
            delta.replace(/(\*|\-|\#){0,}/g, '')
          )
        } catch(ex) {
          buffer += incoming
        }
      }
    }
  } else {
    const data = await response.json()
    content = data.choices[0].message.content
  }
}

update()