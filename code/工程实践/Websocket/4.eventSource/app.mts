import express from 'express';

const app = express();

app.use(express.static(import.meta.dirname))

app.get('/eventSource', (req, res) => {
  // 1. 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 2. 建立连接后，立即发送一条消息
  res.write('data: SSE 连接成功\n\n');

  // 3. 每隔 2 秒推送一条消息
  let count = 0;

  const timer = setInterval(() => {
    count++;

    res.write(`data: 第 ${count} 条消息\n\n`);
  }, 2000);

  // 4. 客户端断开时，清理定时器
  req.on('close', () => {
    clearInterval(timer);
    console.log('SSE 客户端已断开');
  });
});

app.listen(3000, () => {
  console.log('服务启动：http://localhost:3000');
});
