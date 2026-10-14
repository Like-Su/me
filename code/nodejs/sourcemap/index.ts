function main() {
  console.log('hello main')
}

function error() {
  throw new Error('error')
}

main()

error()