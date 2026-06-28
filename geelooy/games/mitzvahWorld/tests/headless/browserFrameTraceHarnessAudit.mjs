// B"H
import fs from 'node:fs';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const js = fs.readFileSync('systems/performance/BrowserFrameTraceHarness.js','utf8');
const html = fs.readFileSync('index.html','utf8');
assert(js.includes('requestAnimationFrame'), 'trace harness must record RAF frames');
assert(js.includes('PerformanceObserver'), 'trace harness must observe long tasks when available');
assert(js.includes('__AWTS_OLAM__'), 'trace harness must expose Olam readiness markers');
assert(html.includes('BrowserFrameTraceHarness.js'), 'index must load browser trace harness');
const mod = await import('../../systems/performance/BrowserFrameTraceHarness.js?audit='+Date.now());
const snap = mod.default.snapshot('node-audit');
assert(snap.realBrowser === false, 'Node audit should honestly report not real browser');
console.log(JSON.stringify({ ok:true, nodeRealBrowser:snap.realBrowser, loaded:true }, null, 2));
