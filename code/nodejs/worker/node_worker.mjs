import { Worker, MessageChannel } from 'node:worker_threads'

const { port1, port2 } = new MessageChannel()

const worker = new Worker()

worker.postMessage(
  { value: 1e8, channel: port2 },
  [port2]
)

port1.on('message', console.log)