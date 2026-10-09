import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import type { ElmentType, Key, Ref, Props, ReactElementType } from 'shared/ReactTypes'

// ReactElement
const ReactElement = function (type: ElmentType, key: Key, ref: Ref, props: Props): ReactElementType {
  const element = {
    // 标识 结构是 React Element
    $$typeof: REACT_ELEMENT_TYPE,
    key,
    ref,
    props,
    type
  }
  return element as ReactElementType
}

export const jsx = function (type: ElmentType, config: any, ...maybeChildren: any): ReactElementType {
  let key: Key = null
  let ref: Ref = null
  const props: Props = {}

  // 遍历配置
  for (const prop in config) {
    const val = config[prop]
    // 特殊字段处理
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val
      }
      continue
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val
      }
      continue
    }
    // 是否为自己的属性而非原型属性
    if (({}).hasOwnProperty.call(config, prop)) {
      props[prop] = val
    }
  }

  const maybeChildrenLength = maybeChildren.length
  if (maybeChildrenLength) {
    if (maybeChildrenLength === 1) {
      props.children = maybeChildren[0]
    } else {
      props.children = maybeChildren
    }
  }

  return ReactElement(type, key, ref, props);
}

// 开发和生产相同实现
export const jsxDEV = function (type: ElmentType, config: any): ReactElementType {
  let key: Key = null
  let ref: Ref = null
  const props: Props = {}

  // 遍历配置
  for (const prop in config) {
    const val = config[prop]
    // 特殊字段处理
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val
      }
      continue
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val
      }
      continue
    }
    // 是否为自己的属性而非原型属性
    if (({}).hasOwnProperty.call(config, prop)) {
      props[prop] = val
    }
  }

  return ReactElement(type, key, ref, props)
};