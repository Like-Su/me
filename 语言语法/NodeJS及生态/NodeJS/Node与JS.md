# NodeJS
> 《JavaScript 二十年》: https://cn.history.js.org/
> 网易游戏框架: https://github.com/NetEase/pomelo

## 生态

## NodeJS 运行时环境
NodeJS 是一个 JS 运行时环境 同时具备 开源和跨平台两个特征, NodeJS 并不是语言而是运行时环境
我们在浏览器中使用的 JS 也是通过 Chrome 等浏览器执行引擎进行运行的
相对应的 JS 运行环境分为很多 如下图:
![](../images/nodejs/1.JavaScript-env.png)

我们可以理解一下 JS 分层, 这里我们从 脚本语言规范\语言实现\运行时环境 来讲讲
- 脚本语言规范: ECMA-262 定义脚本语言该如何表现
- 语言实现/执行引擎: V8,SpiderMonkey,QuickJS,解析,编译,优化,执行, 这里这些都是为了 实现ECMAScript 规定的行为必须的步骤
- 运行时环境: NodeJS/Deno/Bun/浏览器 这些就是运行时的表现层

早期 JS 就是运用于浏览器动效的 而不是 作用于系统编程语言 到 2009 年 Ryan Dahl 发布 NodeJS 初版 这是 因为 V8 引擎发布开源 JS 性能开始有质的飞跃, 再者就是非阻塞I/O与事件驱动架构 因为 Web Application 需要频繁进行 I/O 操作(网络, 数据库, 文件等) 大量 I/O 操作 会阻塞处理流程 这回导致 资源利用率降低 NodeJS 将其事件循环和异步I/O能力整合到运行时中 让其适合处理 大量I/O 密集型操作 最后就是 NodeJS 还提供丰富的系统操作模块 比如 文件系统,网络,进程 等 让开发者可以真正应用于服务端开发的语言, 相对应的 还有些脚本语言 PHP,Python,Ruby 等这些动态脚本语言也在服务端用的开

NodeJS 就是基于事件驱动和非阻塞接口 且 主推就是 单线程 天然异步 API, 单线程意味着业务逻辑无需考虑 锁 问题, 异步 API 意味着可以方便处理并发问题 适合做服务端, 通过内置模块 框架就层出不穷 其中 `express.js`, `Koa.js`, `NestJS` 最为流行, 其中 `express/koa` 适合及其简单的项目, `NestJS` 适用于 企业级服务端的一个框架.

NodeJS 在多个领域都有用到 比如常用的 老牌打包工具, CLI, 简单脚本, Agent 应用开发(Codex/ClaudeCode 等等) 都选择 NodeJS 来实现, 其中还有 桌面端的 VsCode, 1Password, 钉钉 等桌面端软件 都是基于 ElectronJS

虽然新型打包工具有转向 `Go` 和 `Rust` 趋势但是依旧挡不住 `NodeJS` 当年的风采

## 模块规范
Node 中模块规范主要使用 CommonJS 和 ESM, CommonJS 使用最为广泛, ESM 为未来的趋势
1. 最早的模块化方式 IIFE(Immediately Invoked Function Expression) 立即函数调用表达式 定义时就会立即执行 JS 函数, 通过 函数作用域 将其变量与外部隔离开 形成一个模块
```js
(function() {
  // statements
})()
```

之后国内并发出现以下这些模块化解决方案

2. AMD(Asynchronous Module Definition)/CMD(Common Module Defineition)/UMD(Universal Module Definition)
这些模块规范首字母不同 后面两个单词缩写相同 AMD 为 异步模块定义, CMD 为 公共模块定义, UMD 为通用模块定义
AMD 和 CDM 可以说是非常类似, AMD 推崇 依赖前置提前执行, CDM 则是 依赖就加,延迟加载

3. CommonJS(CJS)
这里我们将 CommonJS 单独拉出来, 可见它的重要性, 它是 2009 年由 Mozila 工程师起草的, 而 AMD/CDM 也是在 2009/2010 年附近发展起来的, 包括前端体系也是 到 2010 年之后才迅速发展起来
CommonJS 最初为了除 浏览器之外的运行环境建立模块规范, 最初 CommonJS 叫做 ServerJS 后面才改为 CommonJS 因为想要推进所有运行环境标准化 而 CommonJS 也确实做到了 服务端JS应用,命令行工具,GUI,混合应用 等等你都可以看到 CommonJS 的影子

这里我给出上文所提到的所有模块方案的 mini 实现
- [amd](../../../code/nodejs/module_impl/amd.js)
- [cmd](../../../code/nodejs/module_impl/cmd.js)
- [umd](../../../code/nodejs/module_impl/umd.js)
- [commonjs](../../../code/nodejs/module_impl/commonjs.js)

4. ESM(ECMAScript Modules)
上面的这些模块规范都是 社区以及第三方规范, 并不是官方规范,而ESM就是 ECMAScript 官方模块机制, 该模块机制被内置到 JS 中无需引用外部模块实现机制, ![ESM 首次在 ES6 中提出](https://262.ecma-international.org/6.0/#sec-modules) 它的设计非常简单 通过 `import/export/export default` 等关键字来进行导入导出, 只要宿主有实现那么该语法即可使用, 现代浏览器大多都支持该写法 包括 NodeJS 也在推荐官方的 ESM
![](../images/nodejs/2.JavaScript-modules.png)

5. Node 识别 CJS 和 ESM
通常 `*.mjs` 会被认为是 ESM, `*.cjs` 会被判定为 CJS, 若是普通的 `*.js` 则通过 `package.json` 的 `type` 字段来判断是哪一个模块类型的, 还有一个情况就是通过 `--eval` 参数启动 `node` 时 其中源码对应的 `--input-type` 参数是 commonjs 还是 esm 默认为 commonjs
在 CJS 模块规范下是无法使用 ESM 的, 但 ESM 模块规范可以间接实用 commonjs 的某些规范, 这里我们详细讲讲 在 ESM 中 `require/exports/module.exports` 是不存在的, 但是我们可以通过 import 来导入 CJS 文件 还可以通过 `node:module` 内置的模块来创建一个 require 函数 借此来导入 CJS 模块
```js
// cjs.cjs
const add = (a, b) => {
  return a + b
}

exports.add = add

module.exports = { add }

// esm.mjs
import { createRequire } from "node:module";
import mathCJS from './__test__/math1.cjs'

const require = createRequire(import.meta.filename)

const math = require('./__test__/math')
console.log(math.add(1, 2))
console.log(mathCJS.add(1, 2))
```
但是 CJS 可以通过 `import()` 动态导入来导入 ESM 模块
```js
import('./__test__/math2.mjs').then(math => {
  console.log(math.add(1, 2))
})
```
通过上面我们可以得到 ESM/CJS 的总结 它们在一定情况下可以互通
- CJS 无法实用 ESM 的模块语法, ESM 无法使用 CJS 的模块语法 但是 ESM 可以通过 `node:module` 内置模块来创建一个 导入 CJS 模块的导入器
- CJS 要加载 ESM 有一个办法就是 通过 动他 `import()`

### NodeJS CommonJS 模块本质解析


## Node 调试方法
