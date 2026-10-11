const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const nativeRequire = require;


class Module {
  static _cache = new Map();

  constructor(filename, parent = null) {
    this.id = filename;
    this.filename = filename;
    this.path = path.dirname(filename);
    this.exports = {};
    this.loaded = false;
    this.parent = parent;
    this.children = [];

    parent?.children.push(this);
  }

  // 解析模块路径
  static _resolveFilename(request, parent) {
    if (Module._isBuiltin(request)) return request;

    const base = path.resolve(parent.path, request);
    const candidates = [
      base,
      `${base}.js`,
      path.join(base, 'index.js'),
    ];

    const filename = candidates.find(
      (file) => fs.existsSync(file) && fs.statSync(file).isFile(),
    );

    if (!filename) {
      throw new Error(`Cannot find module '${request}'`);
    }

    return filename;
  }

  // 判断内置模块
  static _isBuiltin(request) {
    return request.startsWith('node:') ||
      Module._builtins.has(request);
  }

  static _builtins = new Set(
    nativeRequire('node:module').builtinModules,
  );

  // 加载模块
  static _load(request, parent) {
    if (Module._isBuiltin(request)) return nativeRequire(request);

    // 文件名解析
    const filename = Module._resolveFilename(request, parent);
    // D:\Project\me\code\nodejs\module_impl\__test__\math.js
    // console.log(filename);
    
    // 命中缓存
    const cached = Module._cache.get(filename);
    if (cached) return cached.exports;

    // 创建模块并提前缓存，支持循环依赖
    const module = new Module(filename, parent);
    Module._cache.set(filename, module);

    try {
      const content = fs.readFileSync(filename, 'utf8');
      module._compile(content, filename);
      module.loaded = true;

      return module.exports;
    } catch (error) {
      Module._cache.delete(filename);
      throw error;
    }
  }

  // 当前模块的 require
  require(request) {
    return Module._load(request, this);
  }

  // 编译并执行模块
  _compile(content, filename) {
    const wrapper = vm.runInThisContext(
      `(function (exports, require, module, __filename, __dirname) {
          ${content}
        })`,
      { filename },
    );

    const require = (request) => this.require(request);

    require.resolve = (request) =>
      Module._resolveFilename(request, this);

    require.cache = Module._cache;

    wrapper.call(
      this.exports,
      this.exports,
      require,
      this,
      filename,
      path.dirname(filename),
    );
  }
}

const mod = new Module(__filename);

const customRequire = (request) => mod.require(request);

customRequire.resolve = (request) =>
  Module._resolveFilename(request, main);

customRequire.cache = Module._cache;


const math = customRequire('./__test__/math');
console.log(math.add(1, 2)); // 3