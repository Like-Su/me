import path from 'node:path'
// import fs from 'node:fs'
import { createRequire } from 'node:module'
import cjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'

const require = createRequire(import.meta.url)
const pkgPath = path.resolve(__dirname, '../../packages')
const distPath = path.resolve(__dirname, '../../dist/')


// 包路径解析
export function resolvePkgPath(pkgName, isDist) {
  if(isDist) {
    return `${distPath}/${pkgName}`
  }
  return `${pkgPath}/${pkgName}`
}

export function getPackageJSON(pkgName) {
  const curPath = `${resolvePkgPath(pkgName)}/package.json`
  return require(curPath)
}

export function getBaseRollupPlugins({
  typescript = {}
} = {}) {
  return [
    ts(typescript),
    cjs(),
    json()
  ]
}