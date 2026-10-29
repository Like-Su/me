function createScheduler() {
  const channel = new MessageChannel();
  const queue = [];

  channel.port1.onmessage = () => {
    const deadline = performance.now() + 5;

    while (
      queue.length > 0 &&
      performance.now() < deadline
    ) {
      const task = queue.shift();
      task();
    }

    if (queue.length > 0) {
      channel.port2.postMessage(null);
    }
  };

  return {
    schedule(task) {
      queue.push(task);

      if (queue.length === 1) {
        channel.port2.postMessage(null);
      }
    }
  };
}

const scheduler = createScheduler();

function renderLargeList(items) {
  let index = 0;

  function renderChunk() {
    const end = Math.min(index + 100, items.length);

    for (; index < end; index++) {
      renderItem(items[index]);
    }

    if (index < items.length) {
      scheduler.schedule(renderChunk);
    }
  }

  scheduler.schedule(renderChunk);
}

function renderItem(item) {
  // 在这里处理一个数据项
  console.log(item);
}

function test1() {
  const result = [];

  for (let i = 0; i < 1000; i++) {
    scheduler.schedule(() => {
      result.push(i);
    });
  }

  setTimeout(() => {
    console.assert(result.length === 1000, '任务数量错误');

    console.assert(
      result.every((value, index) => value === index),
      '任务执行顺序错误'
    );

    console.log('任务完整性测试通过');
  }, 100);
}


function test2() {
  let count = 0;
  let batchCount = 0;

  function task() {
    count++;

    if (count < 10000) {
      scheduler.schedule(task);
    }
  }

  // 同一批任务通过独立的计数任务观察调度情况
  function run() {
    batchCount++;
    scheduler.schedule(task);
  }

  run();

  setTimeout(() => {
    console.log({
      count,
      batchCount,
    });
  }, 100);
}

test2()