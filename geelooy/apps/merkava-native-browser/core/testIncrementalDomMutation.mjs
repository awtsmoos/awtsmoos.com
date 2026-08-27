// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
rt.pushHtml('<body><main id=app><section id=list></section></main></body>', true);
rt.frame();
rt.appendHtml('#list', '<div id=added class=row>Async DOM insertion</div><p>live mutation</p>');
const frame = rt.frame();
const report = rt.report();
if (!rt.window.document.querySelector('#added')) throw new Error('async inserted node missing');
if (report.dom.mutations < 2) throw new Error('mutation queue not populated');
if (!report.log.includes('[dom] appendChild div#added.row -> section#list')) throw new Error('mutation log missing');
console.log(report.log);
console.log(JSON.stringify({ok:true, mutations:report.dom.mutations, invalidations:report.dom.invalidations, renderOps:frame.summary.renderOps}, null, 2));
