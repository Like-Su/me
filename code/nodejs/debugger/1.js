const fs = require('node:fs');
const path = require('node:path');

const content = fs.readFileSync(path.join(path.resolve(__dirname), '..', 'eventEmitter/index.js'), { encoding: 'utf-8' })


