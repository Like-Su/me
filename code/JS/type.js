// jQuery 源码实现
// https://github.com/jquery/jquery/blob/c2f27864e4ffc2d1409c289fcb9a42b6165dfeaf/test/data/jquery-3.7.1.js#L134

const classTypeMap = {}
const toString = classTypeMap.toString
const types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol"]
// 设定 类型映射表
types.forEach(type => {
  classTypeMap[`[object ${type}]`] = type.toLowerCase();
})

function toType(obj) {
  // 判断 null 与 undefined
  if(obj == null) return obj + '';
  return (typeof obj === 'object' || typeof obj === 'function') ? (classTypeMap[toString.call(obj)] || 'object') : typeof obj
}