// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><style>#row{display:flex;width:640px;gap:10px}.item{width:100px;height:30px;background-color:#aabbcc}</style><div id=row><div class=item>A</div><div class=item>B</div><div class=item>C</div><div class=item>D</div></div></body>', true);
const frame = rt.frame({width:760,height:400});
if (!rt.report().log.includes('[layout] flex row width=640 children=4')) throw new Error('flex layout log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, treeNodes:frame.summary.treeNodes, layoutOps:frame.summary.layoutOps}, null, 2));
