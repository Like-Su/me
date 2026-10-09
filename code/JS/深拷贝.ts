// 特殊类型列表
const allowTypes = [Date, RegExp];
const primitiveTypes = new Set([
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'undefined',
]);

/**
 * 判断是否为 Primitive
 */
function isPrimitive(value: unknown): boolean {
  return (
    value === null ||
    primitiveTypes.has(typeof value)
  )
}


/**
 * 判断是否为 Function
 *
 * Function 无法真正进行通用意义上的深克隆，
 * 因此这里采用“共享引用”策略。
 */
function isFunction(
  value: unknown,
): value is Function {
  return typeof value === 'function'
}
/**
 * 深克隆
 */
export function deepClone<T>(
  obj: T,
  map: Map<object, any> = new Map(),
): T {
  if (isPrimitive(obj)) return obj
  if (isFunction(obj)) return obj
  if(map.has(obj as object)) return map.get(obj as object)
  if(obj instanceof Date) {
    const target = new Date(obj.getTime())
    map.set(obj, target)
    return target as T
  }
  if(obj instanceof RegExp) {
    const target = new RegExp(obj.source, obj.flags)
    target.lastIndex = obj.lastIndex
    map.set(obj, target)
    return target as T
  }
  if(obj instanceof Map) {
    const target = new Map()
    map.set(obj, target)
    for(const [key, value] of obj) {
      const clonedKey = deepClone(key, map)
      const clonedValue = deepClone(value, map)
      target.set(
        clonedKey,
        clonedValue
      )
    }
    return target as T
  }
  if(obj instanceof Set) {
    const target = new Set()
    map.set(obj, target)
    for(const value of obj) {
      target.add(deepClone(value, map))
    }
    return target as T
  }
  if(obj instanceof ArrayBuffer) {
    const target = obj.slice(0)
    map.set(obj, target)
    return target as T
  }
  if(typeof SharedArrayBuffer !== 'undefined' && obj instanceof SharedArrayBuffer) {
    const target = obj.slice(0)
    map.set(obj, target)
    return target as T
  }
  if(obj instanceof DataView) {
    const buffer = deepClone(obj.buffer, map) as ArrayBuffer
    const target = new DataView(buffer, obj.byteOffset, obj.byteLength)
    map.set(obj, target)
    return target as T
  }
  if(ArrayBuffer.isView(obj)) {
    const typedArray = obj as any
    const buffer = deepClone(typedArray.buffer, map)

    const target = new typedArray.constructor(
      buffer,
      typedArray.byteOffset,
      typedArray.length,
    )

    map.set(obj, target)

    return target as T
  }
   // ========================================
  // Error
  // ========================================

  if (obj instanceof Error) {
    const target = new (obj.constructor as any)(
      obj.message,
    )

    map.set(obj, target)

    Object.defineProperties(
      target,
      Object.getOwnPropertyDescriptors(obj),
    )

    return target
  }

  const prototype = Object.getPrototypeOf(obj)
  const target = Array.isArray(obj)
    ? []
    : Object.create(prototype)
  
  map.set(obj as object, target)

  const descriptors =
  Object.getOwnPropertyDescriptors(obj)

  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor =
      descriptors[key as keyof typeof descriptors]

    // ========================================
    // Data Property
    // ========================================

    if ('value' in descriptor) {
      descriptor.value = deepClone(
        descriptor.value,
        map,
      )
    }

    // ========================================
    // Getter / Setter
    // ========================================

    // get / set 本身是 Function，
    // 直接保持原引用。
    //
    // descriptor.get
    // descriptor.set

    Object.defineProperty(
      target,
      key,
      descriptor,
    )
  }

  return target
}


const shared = {
  id: 1,
  name: 'shared',
}

const symbolKey = Symbol('symbol-key')

const source: any = {
  // =========================
  // Primitive
  // =========================

  number: 123,

  string: 'hello',

  boolean: true,

  null: null,

  undefined: undefined,

  bigint: 12345678901234567890n,

  symbol: Symbol('symbol-value'),

  // =========================
  // Array
  // =========================

  array: [
    1,
    2,
    3,

    {
      name: 'array-object',

      nested: {
        value: 123,
      },
    },

    [
      4,
      5,
      6,
    ],
  ],

  // =========================
  // Nested Object
  // =========================

  object: {
    name: 'LiKe',

    profile: {
      age: 22,

      address: {
        city: 'Fuzhou',

        country: 'China',
      },
    },
  },

  // =========================
  // Date
  // =========================

  date: new Date('2026-01-01T00:00:00.000Z'),

  // =========================
  // RegExp
  // =========================

  regexp: /hello/gi,

  // =========================
  // Map
  // =========================

  map: new Map([
    ['name', 'LiKe'],

    [
      'user',
      {
        id: 1,
        name: 'LiKe',
      },
    ],
  ]),

  // =========================
  // Set
  // =========================

  set: new Set([
    1,
    2,
    3,

    {
      id: 1,
      name: 'LiKe',
    },
  ]),

  // =========================
  // Shared Reference
  // =========================

  shared1: shared,

  shared2: shared,

  // =========================
  // Function
  // =========================

  fn() {
    return 'hello'
  },

  // =========================
  // Error
  // =========================

  error: new Error('Something went wrong'),

  // =========================
  // TypedArray
  // =========================

  uint8Array: new Uint8Array([
    1,
    2,
    3,
    4,
  ]),

  // =========================
  // ArrayBuffer
  // =========================

  arrayBuffer: new ArrayBuffer(8),
}

// =========================
// Symbol Property
// =========================

source[symbolKey] = {
  value: 123,
}

// =========================
// Non-enumerable Property
// =========================

Object.defineProperty(source, 'hidden', {
  value: {
    secret: 123,
  },

  enumerable: false,

  writable: true,

  configurable: true,
})

// =========================
// Getter / Setter
// =========================

source._name = 'LiKe'

Object.defineProperty(source, 'name', {
  get() {
    return this._name
  },

  set(value) {
    this._name = value
  },

  enumerable: true,

  configurable: true,
})

// =========================
// Circular Reference
// =========================

// 自己引用
source.self = source

// 多层循环引用
source.object.parent = source

// 数组循环引用
source.array.push(source)

// Map 循环引用
source.map.set('self', source)

// Set 循环引用
source.set.add(source)

// =========================
// Clone
// =========================

const r = deepClone(source)

console.log(r)

// =========================
// Check
// =========================

console.log('self:', r.self === r)

console.log(
  'object.parent:',
  r.object.parent === r,
)

console.log(
  'array circular:',
  r.array[r.array.length - 1] === r,
)

console.log(
  'map circular:',
  r.map.get('self') === r,
)

console.log(
  'set circular:',
  r.set.has(r),
)

console.log(
  'shared reference:',
  r.shared1 === r.shared2,
)

console.log(
  'object clone:',
  r.object !== source.object,
)

console.log(
  'array clone:',
  r.array !== source.array,
)

console.log(
  'date clone:',
  r.date !== source.date,
)

console.log(
  'regexp clone:',
  r.regexp !== source.regexp,
)

console.log(
  'map clone:',
  r.map !== source.map,
)

console.log(
  'set clone:',
  r.set !== source.set,
)

console.log(
  'function:',
  r.fn === source.fn,
)

console.log(
  'symbol property:',
  r[symbolKey],
)

console.log(
  'hidden property:',
  r.hidden,
)

console.log(
  'getter:',
  r.name,
)

console.log(
  'typed array:',
  r.uint8Array,
)

console.log(
  'array buffer:',
  r.arrayBuffer,
)