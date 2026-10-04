const state = [1, 2, 3]
let active;

let originalArray = Array.prototype
let arrayMethods = Object.create(originalArray)

function defineReactive(obj) {
  ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
    // 函数劫持
    arrayMethods[method] = function (...args) {
      originalArray[method].call(this, ...args)
      render()
    }
  });
  console.log(arrayMethods)
  obj.__proto__ = arrayMethods
}

defineReactive(state)

function render() {
  console.log('render', state)
}

render()

setInterval(() => {
  state.push(state[state.length - 1] + 1)
}, 1000)