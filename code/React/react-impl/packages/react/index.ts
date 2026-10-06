import pkg from './package.json'
import { jsx } from './src/jsx'

export default {
  version: pkg.version,
  createElement: jsx
}