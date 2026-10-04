const VueTemplateCompiler = require('vue-template-compiler')

const ast = VueTemplateCompiler.compile(`<div>test {{name}}</div>`)

console.log('ast', ast)

// 代码生成, 生成 render 方法 , render 方法执行后生成 虚拟DOM
console.log(ast.render.toString())
// 模板引擎 核心原理
console.log(new Function(ast.render).toString())