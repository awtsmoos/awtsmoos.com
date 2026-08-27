/* B"H */
import { runStressSpec, STRESS_SPECS } from './stressHarness.mjs';
const reports = [];
for (const spec of Object.values(STRESS_SPECS)) reports.push(await runStressSpec(spec));
console.log(JSON.stringify({ ok:true, count:reports.length, maxMs:Math.max(...reports.map(r=>r.ms)), totalFrames:reports.reduce((a,r)=>a+r.rendered,0), reports }));
