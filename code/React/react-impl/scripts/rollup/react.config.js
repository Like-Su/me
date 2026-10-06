import { getPackageJSON, resolvePkgPath, getBaseRollupPlugins } from "./utils.js"
import rollupPluginPackageJson from 'rollup-plugin-generate-package-json'

const { name, module } = getPackageJSON('react')
const pkgPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  // react
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'index.js',
      format: 'umd'
    },
    plugins: [...getBaseRollupPlugins(), rollupPluginPackageJson({
      inputFolder: pkgPath,
      outputFolder: pkgDistPath,
      baseContents: ( {name, description, version }) => {
        return {
          name,
          description,
          version,
          main: 'index.js'
        }
      }
    })]
  },
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'jsx-runtime.js',
        format: 'umd'
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsx-dev-runtime.js',
        format: 'umd'
      }
    ],
    plugins: getBaseRollupPlugins()
  },
]