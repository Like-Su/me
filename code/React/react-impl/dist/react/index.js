(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.index = global.index || {}, global.index.js = factory()));
})(this, (function () { 'use strict';

  var version = "1.0.0";
  var pkg = {
  	version: version};

  // 当前环境是否支持 Symbol
  const supportSymbol = typeof Symbol === 'function' && Symbol.for;
  const REACT_ELEMENT_TYPE = supportSymbol ? Symbol.for('react.symbol') : 0xeac7;

  // ReactElement
  const ReactElement = function (type, key, ref, props) {
      const element = {
          // 标识 结构是 React Element
          $$typeof: REACT_ELEMENT_TYPE,
          key,
          ref,
          props,
          type
      };
      return element;
  };
  const jsx = function (type, config, ...maybeChildren) {
      let key = null;
      let ref = null;
      const props = {};
      // 遍历配置
      for (const prop in config) {
          const val = config[prop];
          // 特殊字段处理
          if (prop === 'key') {
              if (val !== undefined) {
                  key = '' + val;
              }
              continue;
          }
          if (prop === 'ref') {
              if (val !== undefined) {
                  ref = val;
              }
              continue;
          }
          // 是否为自己的属性而非原型属性
          if (({}).hasOwnProperty.call(config, prop)) {
              props[prop] = val;
          }
      }
      const maybeChildrenLength = maybeChildren.length;
      if (maybeChildrenLength) {
          if (maybeChildrenLength === 1) {
              props.children = maybeChildren[0];
          }
          else {
              props.children = maybeChildren;
          }
      }
      return ReactElement(type, key, ref, props);
  };

  var index = {
      version: pkg.version,
      createElement: jsx
  };

  return index;

}));
