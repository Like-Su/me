Array.prototype.myFilter = function(predicate, thisArg) {
  const self = thisArg ?? globalThis;
  const filterRet = [];
  for(let i = 0; i < this.length; i++) {
    if(predicate.apply(self, [this[i], i, this])) filterRet.push(this[i]);
  }
  return filterRet;
}