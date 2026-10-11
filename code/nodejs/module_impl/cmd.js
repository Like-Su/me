function createCMD() {
  const modules = new Map();

  function define(id, factory) {
    modules.set(id, {
      factory,
      exports: {},
      initialized: false
    })
  }

  function require(id) {
    const mod = modules.get(id)

    if (!mod) throw new Error(`module not define ${id}`)

    // 模块加载过 直接返回
    if (mod.initialized) return mod.exports

    mod.initialized = true

    mod.factory(require, mod.exports, mod)

    mod.exports = mod.exports

    return mod.exports
  }

  return { define, require }
}

const cmd = createCMD();

cmd.define('math', function (require, exports) {
  exports.add = (a, b) => a + b;
});

cmd.define('app', function (require, exports) {
  // 在需要的位置加载依赖
  const math = require('math');

  exports.run = () => math.add(1, 2);
});

console.log(cmd.require('app').run()); // 3