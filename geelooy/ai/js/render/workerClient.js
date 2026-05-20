//B"H

let worker = null;
let seq = 0;
const pending = new Map();

export function prepareRecords(records) {
  return askWorker({ records }).then(r => r.records || records.map(fallbackPrepare));
}

export async function workerStoreEvent(event) {
  return (await askWorker({ kind: "storeEvent", event }))?.key || null;
}

export async function workerReadEvent(key) {
  return (await askWorker({ kind: "readEvent", key }))?.event || null;
}

export async function workerStoreRaw(value) {
  return (await askWorker({ kind: "storeRaw", value }))?.key || null;
}

export async function workerReadRaw(key) {
  return (await askWorker({ kind: "readRaw", key }))?.raw || "";
}

function askWorker(message) {
  if (!worker) worker = makeWorker();
  if (!worker) return Promise.resolve({});
  const id = ++seq;
  return new Promise(resolve => {
    pending.set(id, resolve);
    worker.postMessage({ id, ...message });
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
    w.onerror = () => {
      worker = null;
      for (const resolve of pending.values()) resolve({});
      pending.clear();
    };
    return w;
  } catch { return null; }
}

function fallbackPrepare(record) {
  const text = String(record.text || "");
  return { ...record, textLength: text.length, chunks: [{ index: 0, total: 1, text, overflow: false }] };
}
