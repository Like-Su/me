interface Task<T> {
  index: number;
  url: string;
  execute: () => Promise<T>;
}

function concurRequest<T>(urls: string[], maxNum: number = 5) {
  if (urls.length === 0) return Promise.resolve([]);
  if (maxNum <= 0) return Promise.reject(new Error('maxNum must be greater than 0'));

  const results = new Array<T>(urls.length).fill(null as any);

  const queue: Task<T>[] = urls.map((url, index) => {
    return {
      index,
      url,
      execute: () => fetch(url) as Promise<T>
    }
  });

  let completedCount = 0;
  let runningCount = 0;

  return new Promise((resolve, reject) => {
    const next = () => {
      if(runningCount >= maxNum) return ;
      if(queue.length === 0) return ;
      const task = queue.shift()!;
      runningCount++;

      task.execute().then(res => {
        results[task.index] = (res as any).data;
        completedCount++;
      }).catch(err => {
        results[task.index] = err;
        completedCount ++;
      }).finally(() => {
        runningCount--;
        if(completedCount === urls.length) {
          resolve(results);
          return ;
        }
        next();
      })
    }

    for(let i = 0; i < maxNum; i++) {
      next();
    }
  })
}

const r = concurRequest(['https://my-json-server.typicode.com/typicode/demo/profile', 'https://my-json-server.typicode.com/typicode/demo/profile', 'https://my-json-server.typicode.com/typicode/demo/profile', 'https://my-json-server.typicode.com/typicode/demo/profile', 'https://my-json-server.typicode.com/typicode/demo/profile', 'https://my-json-server.typicode.com/typicode/demo/profile'], 3);

r.then(console.log, console.log);