(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    // amd env
    define([], factory)
  } else if(typeof module === 'object' && module.exports) {
    // CommonJS env
    module.exports = factory()
  } else {
    // browser env
    root.MyModule = factory()
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  // module content
  return {
    moduleType() {
      return 'umd'
    }
  }
})