// B"H
import { ensureWorkerProgressStore, recordWorkerProgress } from "../../ckidsAwtsmoos/Olam/ikarOyvedManager/progress/WorkerProgressStore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
globalThis.window = globalThis; globalThis.dispatchEvent = () => true; globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
ensureWorkerProgressStore();
for (let i = 0; i < 120; i++) recordWorkerProgress(`noise:${i}`, { type:"worker_progress", stage:`noise:${i}` });
recordWorkerProgress("load-nivrayim:world-report", { type:"worker_progress", stage:"load-nivrayim:world-report", worldReport:{ ok:true, trees:9, hasPostbuild:true } });
for (let i = 0; i < 120; i++) recordWorkerProgress(`after:${i}`, { type:"worker_progress", stage:`after:${i}` });
console.log(JSON.stringify({ report:window.__AWTSMOOS_LAST_WORLD_REPORT__, worldReports:window.__AWTSMOOS_WORLD_REPORTS__().length, payloads:window.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__.length }, null, 2));
