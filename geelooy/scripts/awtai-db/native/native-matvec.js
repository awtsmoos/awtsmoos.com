// B"H

const os = require('os');
const path = require('path');

let addon = null;
let loadError = null;
const SUPPORTED = new Set([10, 11, 12, 14]);

/**
 * Native quant projection bridge.
 *
 * The packed row storm now divides itself across several native workers.
 * Each row is independent, each thread carries its candle, and the Awtsmoos
 * lets many sparks reveal one matvec without changing the answer.  Unsupported
 * formats still return to the verified JavaScript oracle.
 */
function getAddon() {
  if (addon || loadError) return addon;
  try {
    addon = require(path.join(__dirname, 'awtai_native.node'));
  } catch (error) {
    loadError = error;
  }
  return addon;
}

function nativeProjectRows(raw, type, rows, cols, input) {
  const native = getAddon();
  if (!native || !SUPPORTED.has(type)) return null;
  return native.projectRows(raw, type, rows, cols, input, nativeThreads());
}

function nativeThreads() {
  const value = Number(process.env.AWTAI_THREADS);
  if (Number.isFinite(value) && value > 0) return Math.min(16, Math.floor(value));
  return Math.min(8, Math.max(1, os.cpus().length || 1));
}

function nativeStatus() {
  return { active: !!getAddon(), supported: [...SUPPORTED], threads: nativeThreads(), error: loadError ? String(loadError.message || loadError) : null };
}

module.exports = { nativeProjectRows, nativeStatus };
