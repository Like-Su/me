import { createRequire } from "node:module";
import mathCJS from './__test__/math1.cjs'

const require = createRequire(import.meta.filename)

const math = require('./__test__/math')
console.log(math.add(1, 2))
console.log(mathCJS.add(1, 2))
