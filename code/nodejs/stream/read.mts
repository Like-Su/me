process.stdin.on('readable', function () {
  const buf = process.stdin.read()
  console.log(buf?.toString('utf-8'))
})