import { Readable } from "node:stream"


class ReadableSelf extends Readable {
  private _generator: Generator<any, any, any>;
  constructor(iterator: Generator) {
    super()
    this._generator = iterator
  }

  _read(size: number): void {
    const next = this._generator.next()
    if (next.done) {
      this.push(null)
      return
    } else {
      this.push(next.value)
    }
  }
}
function* GeneratorDemo() {
  yield "艺术美学";
  yield "艺术美学1";
  yield "艺术美学2";
  yield "艺术美学3";
  yield "艺术美学4";
}

const demoGenerator = GeneratorDemo()


function createReadStream(interator: any) {
  return new ReadableSelf(interator)
}

const readableStream = createReadStream(demoGenerator)

readableStream.on('data', (data: any) => {
  console.log(data.toString())
})

readableStream.on('end', () => {
  console.log('done')
})


export { }