// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><div id=clip style="width:200px;height:100px;overflow:hidden;background-color:#dddddd"><p style="height:260px">too tall</p></div></body>', true);
const frame = rt.frame({width:400,height:400});
if (!rt.report().log.includes('[layout] overflow clip')) throw new Error('overflow clip log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, clips:rt.layout.clips.length, renderOps:frame.summary.renderOps}, null, 2));
