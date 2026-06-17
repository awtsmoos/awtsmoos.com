// B"H
import { ensureWorkerProgressStore, recordWorkerProgress } from "../../ckidsAwtsmoos/Olam/ikarOyvedManager/progress/WorkerProgressStore.js";
globalThis.window = globalThis;
globalThis.dispatchEvent = () => true;
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
ensureWorkerProgressStore();
recordWorkerProgress("load-nivrayim:world-report", { type:"worker_progress", stage:"load-nivrayim:world-report", worldReport:{ ok:true, trees:7 } });
console.log(JSON.stringify({ report:window.__AWTSMOOS_LAST_WORLD_REPORT__, payloads:window.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__.length }, null, 2));
