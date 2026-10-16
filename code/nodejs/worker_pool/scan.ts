import { cpus } from 'node:os';
import { MessageChannel, MessagePort, Worker } from "node:worker_threads";
import { Subject } from "rxjs";

interface WorkerJob {
  job: 'scan';
  value: {
    path: string
  }
}


export type WorkerMessage = {
  type: 'scanResult'
  value: {
    results: Array<{
      path: string;
      isTarget: boolean
    }>
  }
} | {
  type: 'scan',
  value: {
    path: string;
  }
} | {
  type: 'startup',
  value: {
    channel: MessagePort
    id: number
  }
}

export class ScanService {
  private index = 0
  private workers: Worker[] = []
  private tunnels: MessagePort[] = []

  startScan(stream$: Subject<string>, path: string) {

  }

  private listenEvents(stream$: Subject<string>) {
    this.tunnels.forEach(tunnel => {
      tunnel.on('message', (data: WorkerMessage) => {
        this.newWorkerMessage(data, stream$)
      })
    })
  }

  private newWorkerMessage(message: WorkerMessage, stream$: Subject<string>) {
    const { type, value } = message

  }
}
