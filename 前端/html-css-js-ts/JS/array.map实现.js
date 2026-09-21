Array.prototype.myMap = function(callbackFn, thisArg) {
  if(this.length <= 0) return [];
  const self = thisArg ?? globalThis;
  const ret = [];

  for(let i = 0; i < this.length; i++) {
    ret.push(callbackFn.call(self, this[i]));
  }

  return ret;
}


const arr = [1,2,3];

const r = arr.myMap((item) => {
  return item + 1;
})

console.log(r)