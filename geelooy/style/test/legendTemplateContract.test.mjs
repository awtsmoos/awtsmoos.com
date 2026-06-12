// B"H
import fs from 'node:fs';
const files = ['geelooy/index.html','geelooy/heichelos/_awtsmoos.heichel.html','geelooy/heichelos/heichel/_awtsmoos.heichel.html','geelooy/heichelos/post/_awtsmoos.post.html'];
const stale = files.filter(file => !fs.readFileSync(file,'utf8').includes('legend-001'));
if (stale.length) throw new Error('templates not legend bumped '+stale.join(','));
console.log('B"H legendTemplateContract.test passed');
