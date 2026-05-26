// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><main id=app><button id=draw style="width:120px;height:40px">draw</button></main></body>', true);
let hits=0; rt.window.document.querySelector('#app').addEventListener('mousedown',()=>hits++); rt.frame(); rt.pointer('pointerdown', 20, 20);
if (!hits) throw new Error('bubble listener not hit');
if (!rt.report().log.includes('[event] capture')) throw new Error('capture log missing');
if (!rt.report().log.includes('[event] bubble')) throw new Error('bubble log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, hits}, null, 2));
