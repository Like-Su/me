class ArrayList<T> {
  private data: (T | undefined)[]

  private size: number

  private used: number

  private compare?: (a: T, b: T) => number

  constructor(
    size: number = 4,
    compare?: (a: T, b: T) => number,
  ) {
    this.size = size
    this.used = 0
    this.data = new Array<T | undefined>(size)
    this.compare = compare
  }

  /**
   * 扩容
   *
   * 1 → 2 → 4 → 8 → 16 ...
   */
  private extend(): void {
    const newSize = this.size === 0 ? 1 : this.size * 2

    const newData = new Array<T | undefined>(newSize)

    for (let i = 0; i < this.used; i++) {
      newData[i] = this.data[i]
    }

    this.data = newData
    this.size = newSize
  }

  /**
   * 获取元素
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.used) {
      return undefined
    }

    return this.data[index]
  }

  /**
   * 推入元素
   */
  push(value: T): void {
    if (this.used >= this.size) {
      this.extend()
    }

    this.data[this.used] = value

    this.used++
  }

  /**
   * 弹出最后一个元素
   */
  pop(): T | undefined {
    if (this.used === 0) {
      return undefined
    }

    const index = this.used - 1
    const value = this.data[index]

    this.data[index] = undefined
    this.used--

    return value
  }

  /**
   * 删除指定元素
   */
  remove(index: number): boolean {
    if (index < 0 || index >= this.used) {
      return false
    }

    for (let i = index; i < this.used - 1; i++) {
      this.data[i] = this.data[i + 1]
    }

    this.data[this.used - 1] = undefined

    this.used--

    return true
  }

  /**
   * 排序
   *
   * 选择排序
   */
  sort(): boolean {
    if (this.used <= 1) {
      return true
    }

    if (this.compare === undefined) {
      return false
    }

    for (let i = 0; i < this.used - 1; i++) {
      let minIndex = i

      for (let j = i + 1; j < this.used; j++) {
        const current = this.data[j]!
        const min = this.data[minIndex]!

        if (this.compare(current, min) < 0) {
          minIndex = j
        }
      }

      if (minIndex !== i) {
        this.swap(i, minIndex)
      }
    }

    return true
  }

  /**
   * 查找
   */
  find(value: T): number {
    if (this.compare === undefined) {
      return -1
    }

    for (let i = 0; i < this.used; i++) {
      const element = this.data[i]!

      if (this.compare(element, value) === 0) {
        return i
      }
    }

    return -1
  }

  /**
   * 交换
   */
  private swap(a: number, b: number): void {
    const temp = this.data[a]

    this.data[a] = this.data[b]
    this.data[b] = temp
  }

  /**
   * 反转
   */
  reverse(): void {
    let left = 0
    let right = this.used - 1

    while (left < right) {
      this.swap(left, right)

      left++
      right--
    }
  }

  /**
   * 左旋
   */
  rotate(k: number): void {
    if (this.used <= 1) {
      return
    }

    k %= this.used

    if (k === 0) {
      return
    }

    this.reverseRange(0, k - 1)
    this.reverseRange(k, this.used - 1)
    this.reverseRange(0, this.used - 1)
  }

  /**
   * 反转指定范围
   */
  private reverseRange(left: number, right: number): void {
    while (left < right) {
      this.swap(left, right)

      left++
      right--
    }
  }

  /**
   * 拼接
   */
  concat(other: ArrayList<T>): void {
    for (let i = 0; i < other.used; i++) {
      this.push(other.data[i]!)
    }
  }

  /**
   * 清空
   *
   * 保留底层容量
   */
  clear(): void {
    for (let i = 0; i < this.used; i++) {
      this.data[i] = undefined
    }

    this.used = 0
  }

  /**
   * 当前元素数量
   */
  length(): number {
    return this.used
  }

  /**
   * 当前容量
   */
  capacity(): number {
    return this.size
  }

  /**
   * 转换为普通数组
   */
  toArray(): T[] {
    return this.data.slice(0, this.used) as T[]
  }
}