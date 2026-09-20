class Semaphore {
  private available: number
  private readonly queue: Array<() => void> = []

  constructor(count: number) {
    this.available = count
  }

  /**
   * 获取一个许可
   */
  acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  /**
   * 释放一个许可
   */
  release(): void {
    const next = this.queue.shift()

    if (next) {
      // 直接把许可交给等待中的任务
      next()
    } else {
      this.available++
    }
  }
}

class CountExample {
  // 允许 200 个请求同时执行
  private static readonly threadTotal = 200

  // 总共接收到 5000 个请求
  private static readonly clientTotal = 5000

  private static count = 0

  static async main(): Promise<void> {
    // Semaphore：最多允许 200 个任务同时执行
    const semaphore = new Semaphore(this.threadTotal)

    const tasks: Promise<void>[] = []

    for (let i = 0; i < this.clientTotal; i++) {
      const task = (async () => {
        try {
          // 获取许可
          await semaphore.acquire()

          this.add()

          // 释放许可
          semaphore.release()
        } catch (error) {
          console.error('exception', error)
        }
      })()

      tasks.push(task)
    }

    // 等待所有任务完成
    await Promise.all(tasks)

    console.log(`count: ${this.count}`)
  }

  private static add(): void {
    this.count++
  }
}

CountExample.main()