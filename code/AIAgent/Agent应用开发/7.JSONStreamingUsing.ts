import { JSONParser } from "./7.JSONStreaming.ts";
import { set, get } from 'jsonuri'

let question = '中华传说'
let content = ''
let contentParsed = {
  story_instruction: '',
  the_whole_story_content: '',
  the_whole_story_translate_to_en: '',
  lessons: []
}

const systemPrompt = `
根据用户输入的主题，用**中文**输出以下JSON格式内容：
{
"story_instruction": "",
"the_whole_story_content": "",
"the_whole_story_translate_to_en": "",
"lessons": []
}
`;

const updateConsole = (consoleContent: string) => {
  content = consoleContent;
  process.stdout.write(content)
}


const update = async () => {
  if (!question) return;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_KEY_COMMON}`
  }

  const response = await fetch(`${process.env.OPENAI_BASE_URL_COMMON as string}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-R1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      stream: true,
    })
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  const jsonParser = new JSONParser()

  jsonParser.on('data', ({uri, delta}: any) => {
    console.log(uri, delta)
    const content = get(contentParsed, uri)
    set(contentParsed, uri, (content || '') + delta)
  })

  let done = false
  let buffer = ''
  updateConsole('')

  while(!done) {
    const { value, done: doneReading } = await (reader?.read() as Promise<{ value: any; done: boolean; }>)
    done = doneReading
    const chunkValue = buffer + decoder.decode(value)
    buffer = ''
    const lines = chunkValue.split('\n').filter(line => line.startsWith('data: '))

    for(const line of lines) {
      const incoming = line.slice(6);
      if(incoming === '[DONE]') {
        done = true
        break
      }

      try {
        const data = JSON.parse(incoming)
        const delta = data.choices[0].delta.reasoning_content
        
        if(delta) {
          content += delta
          jsonParser.trace(delta)
        }
      } catch(e) {
        buffer += incoming
      }
    }
  }

  updateConsole(content)
}

update()