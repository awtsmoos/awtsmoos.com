// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><canvas id=stage width=200 height=80></canvas><button id=after style="width:120px;height:40px">after</button></body>', true);
rt.frame(); const hit = rt.pointer('pointermove', 30, 30);
if (!hit.target.includes('canvas#stage')) throw new Error('expected canvas hit, got '+hit.target);
if (!rt.report().log.includes('[event] hover enter')) throw new Error('hover log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, target:hit.target}, null, 2));
