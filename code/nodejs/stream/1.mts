import http from 'node:http'
import fs from 'node:fs'

// const fileName = import.meta.dirname + '/bigData.txt';
const fileName = import.meta.dirname + '/1.jpeg';
const server = http.createServer(async function (req, res) {
  // res.setHeader('content-type', 'image/jpeg');
  const data = fs.readFileSync(fileName);
  res.end(data);
});

server.listen(8000);

const server2 = http.createServer(async function (req, res) {
  res.setHeader('content-type', 'image/jpeg');
  const readStream = fs.createReadStream(fileName)
  readStream.pipe(res)
});

server2.listen(8001);