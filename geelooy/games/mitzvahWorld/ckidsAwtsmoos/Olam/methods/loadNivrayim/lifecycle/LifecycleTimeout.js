// B"H
/** LifecycleTimeout.js — no single vessel may trap the loader behind the veil. */
export class LifecycleTimeoutError extends Error { constructor(label, ms, phase) { super(`B"H - ${phase} timeout: "${label}" exceeded ${ms}ms.`); this.name = "LifecycleTimeoutError"; this.phase = phase; } }
export function withTimeout(promise, ms, label, phase) {
  let handle;
  const timeout = new Promise((_, reject) => { handle = setTimeout(() => reject(new LifecycleTimeoutError(label, ms, phase)), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(handle));
}
