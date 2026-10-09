# React
> 打包工具分析: https://bundlers.tooling.report/

## JSX
1. JSX 本质:
  - `React.createElement` React 17 之前
  - `_jsx` React 17 之后
2. React 编译与运行时
  - 编译时: babel 进行编译
  - 运行时: jsx 或 React.createElement 方法实现, 打包流程, 调试打包结果环境

## Reconciler 协调器(DIFF 算法)
1. React 消费JSX 但是React没有编译优化,所以 React 是一个纯运行时框架
2. Reconciler 如何消费 JSX
  - ReactElement 的缺陷: 无法表达节点之间关系, 字段有限不好扩展
  - 引入新的数据结构 链表: 介于 ReactElement 与 真实UI节点之间, 能表达节点之间关系与方便扩展 这就是 FiberNode(虚拟DOM在 React 中实现)
  - React 节点类型: JSX, ReactElement, FiberNode, DOMElement
3. Reconciler 工作方式
  - 