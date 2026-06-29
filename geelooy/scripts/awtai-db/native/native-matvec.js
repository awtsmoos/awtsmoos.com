// B"H

const os = require('os');
const path = require('path');

let addon = null;
let loadError = null;
const SUPPORTED = new Set([10, 11, 12, 14]);

/** Native quant bridges: rows today, fused layers tomorrow. */
function getAddon() {
  if (addon || loadError) return addon;
  try { addon = require(path.join(__dirname, 'awtai_native.node')); }
  catch (error) { loadError = error; }
  return addon;
}

function nativeProjectRows(raw, type, rows, cols, input) {
  const native = getAddon();
  if (!native || !SUPPORTED.has(type)) return null;
  return native.projectRows(raw, type, rows, cols, input, nativeThreads());
}

function nativeFfn(gateRaw, gateType, upRaw, upType, downRaw, downType, hidden, ffn, input) {
  const native = getAddon();
  if (!native || typeof native.fusedFfn !== 'function') return null;
  if (!SUPPORTED.has(gateType) || !SUPPORTED.has(upType) || !SUPPORTED.has(downType)) return null;
  return native.fusedFfn(gateRaw, gateType, upRaw, upType, downRaw, downType, hidden, ffn, input, nativeThreads());
}

function nativeThreads() {
  const value = Number(process.env.AWTAI_THREADS);
  if (Number.isFinite(value) && value > 0) return Math.min(16, Math.floor(value));
  return Math.min(8, Math.max(1, os.cpus().length || 1));
}

function nativeStatus() {
  return {
    active: !!getAddon(),
    supported: [...SUPPORTED],
    threads: nativeThreads(),
    fusedFfn: !!(getAddon() && addon.fusedFfn),
    error: loadError ? String(loadError.message || loadError) : null,
  };
}

module.exports = { nativeProjectRows, nativeFfn, nativeStatus };
