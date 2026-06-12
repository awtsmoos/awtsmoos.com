// B"H
import fs from 'node:fs';
import path from 'node:path';
const roots = ['geelooy/style/foundation/legend','geelooy/style/social/home/legend','geelooy/style/heichelos/heichel/legend','geelooy/heichelos/post/styles/reader-legend'];
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const bad = roots.flatMap(files).filter(file => file.endsWith('.css')).filter(file => /overflow\s*:\s*hidden|height\s*:\s*100vh/.test(fs.readFileSync(file,'utf8')));
if (bad.length) throw new Error('legend scroll trap '+bad.join(','));
console.log('B"H noLegendScrollTrap.test passed');
