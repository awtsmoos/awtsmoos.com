// B"H
import fs from 'node:fs';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const policy = fs.readFileSync('systems/performance/RuntimeLoopPolicy.js','utf8');
const trace = fs.readFileSync('systems/performance/BrowserFrameTraceHarness.js','utf8');
const hud = fs.readFileSync('systems/mobile/MobileCleanHudRuntime.js','utf8');
assert(policy.includes('rafLoop') && policy.includes('defer'), 'RuntimeLoopPolicy must expose rafLoop and defer');
assert(trace.includes('RuntimeLoopPolicy.js') && !trace.includes('setTimeout?.(() => harness.start'), 'Browser trace must use loop policy');
assert(hud.includes('RuntimeLoopPolicy.js') && hud.includes('world-first-pass-2'), 'Mobile HUD must use loop policy and pass 2');
console.log(JSON.stringify({ ok:true, loopPolicy:true, migrated:['BrowserFrameTraceHarness','MobileCleanHudRuntime'] }, null, 2));
