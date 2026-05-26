// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><p style="width:120px;font-size:16px">This inline sentence should wrap across multiple executor-computed lines.</p></body>', true);
rt.shapeText('This inline sentence should wrap across multiple executor-computed lines.', {'font-size':'16px'}, 120);
const frame = rt.frame({width:220,height:400});
if (!rt.report().log.includes('[text] linebreak')) throw new Error('text linebreak log missing');
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, layoutOps:frame.summary.layoutOps, atlas:rt.report().textAtlasGlyphs}, null, 2));
