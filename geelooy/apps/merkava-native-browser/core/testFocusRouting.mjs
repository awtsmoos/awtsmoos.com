// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><input id=name value=abc style="width:160px;height:30px"></body>', true);
rt.frame(); rt.pointer('pointerdown', 20, 20); rt.keyboard('keydown','A');
if (rt.window.document.activeElement?.id !== 'name') throw new Error('focus did not route to input');
if (!rt.report().log.includes('[event] focus changed target=input#name')) throw new Error('focus log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, active:rt.window.document.activeElement.id}, null, 2));
