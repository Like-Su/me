// 合并钩子方法
function mergeHook(parentVal, childVal) {
  // 设置合并策略
  if(childVal) {
    if(parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

function callHook(vm, hookName) {
  return vm.options[hookName] && vm.options[hookName].forEach(h => h())
}

function mergeOptions(parent, child) {
  let opts = {}
  for(let key in child) {
    opts[key] = mergeHook(parent[key], child[key]);
  }
  return opts
}

function Vue (options) {
  this.options = mergeOptions(this.constructor.options, options)

  callHook(this, 'beforeCreate')
  callHook(this, 'created')
}

// 模板选项
Vue.options = {}

new Vue({
  beforeCreate() {
    console.log('before Create')
  },
  created() {
    console.log('created')
  }
})