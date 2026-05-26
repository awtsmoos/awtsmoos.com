//B"H

let worker = null;
let seq = 0;
const pending = new Map();
const ASK_TIMEOUT = 8000;
const MAX_PENDING = 160;

export function prepareRecords(records) {
  return askWorker({ records }).then(r => r.records || records.map(fallbackPrepare));
}

export async function workerStoreEvent(event, key = "") {
  return (await askWorker({ kind: "storeEvent", event, key }))?.key || null;
}

export async function workerReadEvent(key) {
  return (await askWorker({ kind: "readEvent", key }))?.event || null;
}

export async function workerStoreRaw(value, key = "") {
  return (await askWorker({ kind: "storeRaw", value, key }))?.key || null;
}

export async function workerReadRaw(key) {
  return (await askWorker({ kind: "readRaw", key }))?.raw || "";
}

export async function resetRenderWorkerStores() {
  return (await askWorker({ kind: "resetStores" }))?.stats || null;
}

export async function renderWorkerStoreStats() {
  return (await askWorker({ kind: "storeStats" }))?.stats || null;
}

function askWorker(message) {
  if (pending.size > MAX_PENDING) resetWorker("too many pending render-worker replies");
  if (!worker) worker = makeWorker();
  if (!worker) return Promise.resolve({});
  const id = ++seq;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({});
    }, ASK_TIMEOUT);
    pending.set(id, payload => {
      clearTimeout(timer);
      resolve(payload || {});
    });
    try { worker.postMessage({ id, ...message }); }
    catch {
      clearTimeout(timer);
      pending.delete(id);
      resetWorker("postMessage failed");
      resolve({});
    }
  });
}

function makeWorker() {
  try {
    const w = new Worker(new URL("./worker/renderWorker.js", import.meta.url), { type: "module" });
    w.onmessage = event => {
      const { id, ...payload } = event.data || {};
      pending.get(id)?.(payload);
      pending.delete(id);
    };
    w.onerror = () => resetWorker("render worker error");
    return w;
  } catch { return null; }
}

function resetWorker(reason = "") {
  try { worker?.terminate?.(); } catch {}
  worker = null;
  for (const resolve of pending.values()) resolve({ error: reason });
  pending.clear();
}

function fallbackPrepare(record) {
  const text = String(record.text || "");
  return { ...record, textLength: text.length, chunks: [{ index: 0, total: 1, text, overflow: false }] };
}

globalThis.awtsmoosResetRenderWorkerStores = resetRenderWorkerStores;
globalThis.awtsmoosRenderWorkerStoreStats = renderWorkerStoreStats;
