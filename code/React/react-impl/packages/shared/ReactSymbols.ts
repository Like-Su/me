// 当前环境是否支持 Symbol
const supportSymbol = typeof Symbol === 'function' && Symbol.for

export const REACT_ELEMENT_TYPE = supportSymbol ? Symbol.for('react.symbol') : 0xeac7;