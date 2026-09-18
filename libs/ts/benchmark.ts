/**
 * @name Benchmark
 * @description 性能测试工具，提供函数执行耗时的基础测试能力
 * @author LK
 * @date 2026-09-17
 * @version 1.0.0
 */

export interface BenchmarkResult {
  /** 执行次数 */
  iterations: number

  /** 总耗时，单位 ms */
  totalTime: number

  /** 平均每次耗时，单位 ms */
  averageTime: number
}

export function benchmark(
  fn: () => void,
  timeer: number = 1000,
): BenchmarkResult {
  const startTime = performance.now()
  let iterations = 0
  while(performance.now() - startTime < timeer) {
    fn()
    iterations++
  }
  const endTime = performance.now()
  const totalTime = endTime - startTime
  return {
    iterations,
    totalTime,
    averageTime: totalTime / iterations,
  }
}

export function benchmarkMs(fn: () => void, ms: number = 1000) {
  const totalTime = benchmark(fn, ms);
  return {
    iterations: totalTime,
    totalTime: `${(totalTime.totalTime).toFixed(3)}ms`,
    averageTime: `${(totalTime.averageTime).toFixed(3)}ms`,
  }
}