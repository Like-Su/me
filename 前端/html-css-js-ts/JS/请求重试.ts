/**
 * 重试请求, 返回 Promise
 * @param url url
 * @param maxCount retry count
 */
function requestService(url: string, maxCount: number = 5): Promise<any> {
  return fetch(url).catch(reason => maxCount <= 0 ? Promise.reject(reason) : requestService(url, Math.max(0, maxCount - 1)));
}

requestService('https://my-json-server.typicode.com/typicode/demo/profile').then(res => {
  console.log(res)
})
