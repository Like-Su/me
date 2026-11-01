# Memory 记忆管理

## Memory 是什么
Memory 就是记忆 和 人类相同, 传统 LLM 模型调用是无状态的, 例如下例
```ts
const response = await model.invoke([
  {
    role: 'user',
    content: '请你介绍一下 Memory',
  },
])

// 第二次调用
const response = await model.invoke([
  {
    role: 'user',
    content: '请你把刚刚介绍的 Memory 总结一下',
  },
])
```

通过我们两轮模型调用 它们之间是无状态的, 因为第二轮调用时没有带上 历史信息 所以 就会出现 模型可以处理当前事情 但无法得知之前发生的事情

## Memory 管理策略

## 