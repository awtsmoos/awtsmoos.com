// B"H
const fs = require('fs');
const p = 'api/liveHandle/writer/map_ops/setter.js';
let s = fs.readFileSync(p, 'utf8');
const dup = `        const assumeNew = (options && typeof options === 'object' && options.assumeNew) || false;\n        const skipIndexes = (options && typeof options === 'object' && options.skipIndexes) || false;\n        const skipOldState = assumeNew || (options && typeof options === 'object' && options.skipOldState) || false;\n        const assumeNew = (options && typeof options === 'object' && options.assumeNew) || false;\n        const skipIndexes = (options && typeof options === 'object' && options.skipIndexes) || false;\n        const skipOldState = assumeNew || (options && typeof options === 'object' && options.skipOldState) || false;`;
const one = `        const assumeNew = (options && typeof options === 'object' && options.assumeNew) || false;\n        const skipIndexes = (options && typeof options === 'object' && options.skipIndexes) || false;\n        const skipOldState = assumeNew || (options && typeof options === 'object' && options.skipOldState) || false;`;
s = s.replace(dup, one);
fs.writeFileSync(p, s);
console.log('fixed duplicate setter declarations');
