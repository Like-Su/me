import 'dotenv/config'

let prompt = '我应该如何帮助你呢?'
let status = 'ready'
let audioUrl = ''

function createBlobURL(base64AndAudioData) {
  const byteArrays = new Array()
  const byteCharacters = atob(base64AndAudioData)
  for(const offset = 0; offset < byteCharacters.length; offset++) {
    const byteArray = byteCharacters.charCodeAt(offset)
    byteArrays.push(byteArray)
  }

  const blob = new Blob([new Uint8Array(byteArrays)], { type: 'audio/mp3' })

  return URL.createObjectURL(blob)
}

const generateAudio = async () => {
  const voiceName = 'seed-audio-1.0'

  const payload = {
    model: voiceName,
    text_prompt: prompt,
  }
}