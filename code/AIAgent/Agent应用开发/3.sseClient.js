import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const endpoint = 'http://localhost:3000/stream'
const headers = {
  'Content-Type': 'application/json',
  // Authorization: `Bearer ${process.env.OPENAI_KEY}`
}

const questionDOM = document.querySelector('input')
const sendButton = document.querySelector('button')

const container = document.querySelector('.container')

let content = ''
let stream = true

const render = (content) => {
  container.innerHTML = content
}

const update = async () => {
  let question = questionDOM.value
  if (!question) return
  content = '思考中...'
  render(content)
  if (stream) {
    content = ''
    const eventSource = new EventSource(`${endpoint}?question=${question}`)
    eventSource.addEventListener('message', (e) => {
      content += e.data
      render(marked.parse(content))
    })
  } else {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: question }],
        stream,
      })
    })
    const data = await response.json()
    content = data.choices[0].message.content
    render(content)
  }
}

// update()

sendButton.onclick = update;
