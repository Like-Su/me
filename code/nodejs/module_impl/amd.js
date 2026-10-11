function createAMD() {
  const modules = new Map()

  // 定义模块
  function define(id, deps, factory) {
    modules.set(id, {
      // 依赖
      deps,
      // 模块
      factory,
      // 导出
      exports: undefined,
      // 是否加载
      initialized: false,
    })
  }


  function require(id) {
    const mod = modules.get(id)
    if (!mod) throw new Error(`module not define ${id}`)

    // 模块加载过 直接返回
    if (mod.initialized) return mod.exports

    // 加载所有依赖
    const args = mod.deps.map(require)

    // 执行模块
    mod.exports = mod.factory(...args)
    mod.initialized = true

    return mod.exports
  }

  return { define, require }
}

// 使用方式
const amd = createAMD();

amd.define('math', [], function () {
  return {
    add(a, b) {
      return a + b;
    },
  };
});

amd.define('app', ['math'], function (math) {
  return {
    run() {
      return math.add(1, 2);
    },
  };
});

console.log(amd.require('app').run()); // 3