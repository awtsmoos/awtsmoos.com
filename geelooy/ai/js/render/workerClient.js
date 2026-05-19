//B"H

let worker = null;
let seq = 0;
const pending = new Map();

export function prepareRecords(records) {
  if (!worker) worker = makeWorker();
  if (!worker) return Promise.resolve(records.map(fallbackPrepare));
  const id = ++seq;
  return new Promise(resolve => {
    pending.set(id, resolve);
    worker.postMessage({ id, records });
  });
}

function makeWorker() {
  try {
    const w = new Worker(new URL("./worker/renderWorker.js", import.meta.url), { type: "module" });
    w.onmessage = event => {
      const { id, records } = event.data || {};
      pending.get(id)?.(records || []);
      pending.delete(id);
    };
    w.onerror = () => {
      worker = null;
      for (const resolve of pending.values()) resolve([]);
      pending.clear();
    };
    return w;
  } catch {
    return null;
  }
}

function fallbackPrepare(record) {
  const text = String(record.text || "");
  return {
    ...record,
    textLength: text.length,
    chunks: [{ index: 0, total: 1, text, overflow: false }]
  };
}
