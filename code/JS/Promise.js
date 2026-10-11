class MePromise {}
MePromise.withResolvers = function() {
  let obj = {resolve: null, reject: null};

  new Promise((resolve, reject) => {
    obj['resolve'] = resolve
    obj['reject'] = reject
  })
  return obj;
}


let { resolve, reject } = Promise.withResolvers();
console.log(resolve);
let { resolve: meResove, reject: meReject } = MePromise.withResolvers();
console.log(meResove);
