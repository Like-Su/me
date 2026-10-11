# ES6+ 与 ECMAScript 新标准

## 变量声明与作用域

### `let`、`const` 与 `var`

### 块级作用域

### 暂时性死区（TDZ）

### 变量提升与重复声明

### 解构赋值

### 模板字符串

### 扩展运算符与剩余参数

## 函数与参数

### 箭头函数

### 默认参数

### 剩余参数与展开语法

### 参数解构与函数返回值

### 箭头函数与普通函数的区别

### 函数参数与 `arguments`

## 对象与属性增强

### 属性简写与方法简写

### 计算属性名

### 属性遍历与对象枚举

### 对象解构与深浅拷贝

### `Object.assign`

### 可选链 `?.`

### 空值合并运算符 `??`

### 逻辑赋值运算符

### `Object.hasOwn`

## Symbol 与元编程

### `Symbol` 的作用与特性

### 全局 Symbol 注册表

### 内置 Symbol

### `Symbol.iterator` 与可迭代协议

### `Symbol.toPrimitive`

### `Reflect` API

### Proxy 与对象代理

### Proxy 与 Reflect 的配合

## 迭代器与生成器

### 可迭代协议与迭代器协议

### `for...of` 与 `for...in`

### `Iterator` 与 `Iterable`

### 生成器函数 `function*`

### `yield` 与 `yield*`

### 生成器与异步控制

### Iterator Helpers

## Class 与面向对象

### `class` 的基本语法

### 构造函数与 `constructor`

### 实例方法与静态方法

### 公共字段与私有字段

### Getter 与 Setter

### `extends` 与 `super`

### Class 与原型链

### 静态初始化块

### `new.target`

## Module 模块化

### 模块化的演进：IIFE、CommonJS 与 ESM

### `export` 与 `import`

### 默认导出与命名导出

### 重命名导入与导出

### 动态导入 `import()`

### `import.meta`

### 模块作用域与严格模式

### ESM 的静态结构与编译时分析

### 实时绑定（Live Bindings）

### 循环依赖与执行顺序

### CommonJS 与 ESM 的区别

### 模块加载、解析与缓存

## Set 与 Map

### `Set` 与元素唯一性

### `WeakSet` 与弱引用

### `Map` 与键值映射

### `WeakMap` 与对象关联数据

### `Set`、`Map` 与普通对象的区别

### SameValueZero 与键比较规则

### 集合遍历与转换

### 使用 Set 与 Map 实现去重、缓存与索引

## Promise 与异步编程

### Promise 的状态与生命周期

### `Promise` 的创建与执行机制

### `then`、`catch` 与 `finally`

### Promise 链式调用与返回值穿透

### Promise 的错误传播机制

### `Promise.resolve` 与 `Promise.reject`

### `Promise.all`、`Promise.race`

### `Promise.allSettled`、`Promise.any`

### `Promise.withResolvers`

### `Promise.try`

### Promise 与微任务队列

### 手写 Promise 核心实现

## 异步函数与新异步能力

### `async` 与 `await`

### `await` 的暂停与恢复机制

### 异常处理与 `try...catch`

### 并发执行与串行执行

### 异步迭代器与 `for await...of`

### `Promise` 与事件循环

### `using` 与 `await using`

## 数组与字符串新特性

### 数组解构与扩展运算符

### `Array.from` 与 `Array.of`

### `find`、`findIndex` 与 `findLast`

### `includes` 与 `flat`、`flatMap`

### `at` 与相对索引

### `toSorted`、`toReversed`、`toSpliced`

### `with` 与不可变数组操作

### `String` 新增方法与 Unicode 处理

## 数值、日期与正则表达式

### `Number` 新增方法与安全整数

### `BigInt` 与大整数运算

### `Math` 新增方法

### `Intl` 国际化 API

### `Temporal` 日期与时间 API

### 正则表达式命名捕获组

### 正则表达式后行断言

### `matchAll` 与正则表达式迭代

## 元编程与资源管理

### `Proxy` 与 Reflect 的高级应用

### 装饰器（Decorators）

### 显式资源管理与 `Symbol.dispose`

### `Symbol.asyncDispose` 与异步资源释放

### `DisposableStack` 与 `AsyncDisposableStack`

## ECMAScript 新标准追踪

### ECMAScript 标准与 TC39 提案流程

### Stage 3 与 Stage 4 提案的区别

### 不同运行时的特性支持

### 新特性的兼容性与 Polyfill

### Babel、TypeScript 与目标环境配置

### 新标准特性在浏览器与 Node.js 中的差异

## 高频面试与综合实践

### `var`、`let` 与 `const` 的底层区别

### 箭头函数与普通函数的区别

### 解构赋值与展开运算符的边界

### ESM 与 CommonJS 的加载机制

### Class 与原型继承的关系

### Set、Map 与 WeakMap 的使用场景

### Promise 链式调用与微任务执行顺序

### 手写 Promise 并发控制器

### 使用 Proxy 与 Reflect 实现响应式对象

### 使用 ESM 设计可复用模块