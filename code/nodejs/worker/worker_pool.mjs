import os, { type } from 'node:os'
import { Worker, MessageChannel } from 'node:worker_threads'

const poolSize = os.cpus().length

const workers = [],
  tunnels = [];

for (let i = 0; i < poolSize; i++) {
  const { port1, port2 } = new MessageChannel()

  const worker = new Worker('./worker_pool2.mjs')

  worker.postMessage(
    {
      type: 'startup',
      id: i,
      channel: port2
    },
    [port2]
  )
  workers.push(worker)

  tunnels.push(port1)
}

for (let i = 0; i < tunnels.length; i++) {
  tunnels[i].on('message', (msg) => {
    console.log(`线程 ${msg.id} 计算出了结果 ${msg.res}`);
  });
}

let curIndex = 0;

function addJob(num) {
  const tunnel = tunnels[curIndex];

  tunnel.postMessage({
    value: num
  });

  curIndex = curIndex >= workers.length - 1 ? 0 : curIndex + 1;
}

for (let i = 0; i < 100; i++) {
  addJob(Math.floor(Math.random() * 1000000));
}

// CPU 核心数量
console.log(os.cpus().length)
// console.log(os.cpus())

