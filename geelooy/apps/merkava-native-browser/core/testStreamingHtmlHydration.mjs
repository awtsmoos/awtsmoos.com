// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
const chunks = ['<body><main id=feed>', ...Array.from({length:60}, (_,i)=>'<article class=card><h2>Post '+i+'</h2><p>streamed text '+i+'</p></article>'), '<script src="/late.js"></script></main></body>'];
for (let i=0;i<chunks.length;i++) rt.pushHtml(chunks[i], i===chunks.length-1);
const frame = rt.frame({width:760,height:900});
const report = rt.report();
if (report.dom.createdNodes < 180) throw new Error('expected large streaming DOM, got '+report.dom.createdNodes);
if (!report.log.includes('[hydrate] createdNodes')) throw new Error('missing hydrate log');
if (!report.log.includes('[script] ordered')) throw new Error('missing script ordering log');
console.log(report.log);
console.log(JSON.stringify({ok:true, createdNodes:report.dom.createdNodes, invalidations:report.dom.invalidations, renderOps:frame.summary.renderOps}, null, 2));
