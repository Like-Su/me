let state = { count: 0 };
let activeEffect = null;

// 转换为响应式数据
function defineReactive(obj) {
  for (let key in obj) {
    let value = obj[key];
    // 依赖
    let dep = [];
    Object.defineProperty(obj, key, {
      get() {
        // 是否有依赖, 有依赖则加入
        if(activeEffect) {
          dep.push(activeEffect);
        }
        return value;
      },
      set(newVal) {
        value = newVal;
        // 更新 则通知所有 watcher 依赖
        dep.forEach(watcher => watcher());
      }
    })
    defineReactive(value);
  }
}

// 转换为响应式
defineReactive(state);


const watcher = (fn) => {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

watcher(() => {
  console.log('render', state.count);
})

watcher(() => {
  console.log('getter', state.count);
});

setInterval(() => {
  state.count += 1;
}, 1000);