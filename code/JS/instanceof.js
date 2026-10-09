function instanceofType(instance, Constructor) {
  if (
    instance === null ||
    (typeof instance !== 'object' &&
      typeof instance !== 'function')
  ) {
    return false;
  }
  // 检测左值是否合法
  if (typeof Constructor !== 'function') {
    throw new TypeError('右侧参数必须是构造函数');
  }

  const targetPrototype = Constructor.prototype;

  if(targetPrototype ===  null || (typeof targetPrototype !== 'object' && typeof targetPrototype !== 'function')) {
    throw new TypeError('Constructor.prototype 必须是对象');
  }

  let current = Object.getPrototypeOf(instance);

  while(current !== null) {
    if(current === targetPrototype) return true;
    current = Object.getPrototypeOf(current);
  }

  return false;
}

class A {}

class B extends A {}

const b = new B()

const r = instanceofType(b, A)
console.log(r)


// 核心实现
function _instanceof(instance, Constructor) {
  let targetPrototype = Constructor.prototype;
  // let current = instance.__proto__;
  let current = Object.getPrototypeOf(instance);
  while(current !== null) {
    if(current === targetPrototype) return true;
    current = Object.getPrototypeOf(current);
  }
  return false
}
 
// 实例.__proto__ === 类.prototype
console.log(_instanceof([], Array))
console.log(_instanceof([], Object))