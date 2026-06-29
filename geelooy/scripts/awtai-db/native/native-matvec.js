// B"H
const os = require('os');
const path = require('path');

let addon = null;
let loadError = null;
const SUPPORTED = new Set([10, 11, 12, 14]);

function getAddon() {
  if (addon || loadError) return addon;
  try { addon = require(path.join(__dirname, 'awtai_native.node')); }
  catch (e) { loadError = e; }
  return addon;
}

function nativeProjectRows(raw, type, rows, cols, input) {
  const n = getAddon();
  if (!n || !SUPPORTED.has(type)) return null;
  return n.projectRows(raw, type, rows, cols, input, nativeThreads());
}

function nativeProjectFileRows(filePath, offset, type, rows, cols, input) {
  const n = getAddon();
  if (!n || !SUPPORTED.has(type) || typeof n.projectFileRows !== 'function') return null;
  return n.projectFileRows(filePath, offset, type, rows, cols, input, projectWindowRows());
}

function nativeProjectF32Rows(weights, rows, cols, input) {
  const n = getAddon();
  if (!n || typeof n.projectF32Rows !== 'function') return null;
  return n.projectF32Rows(weights, rows, cols, input);
}

function nativeMmapF32TopK(filePath, rows, cols, input, k, windowRows = 512) {
  const n = getAddon();
  if (!n || typeof n.mmapF32TopK !== 'function') return null;
  return n.mmapF32TopK(filePath, rows, cols, input, k, windowRows);
}

function nativeFfn(gateRaw, gateType, upRaw, upType, downRaw, downType, hidden, ffn, input) {
  const n = getAddon();
  if (!n || typeof n.fusedFfn !== 'function') return null;
  if (!SUPPORTED.has(gateType) || !SUPPORTED.has(upType) || !SUPPORTED.has(downType)) return null;
  return n.fusedFfn(gateRaw, gateType, upRaw, upType, downRaw, downType, hidden, ffn, input, nativeThreads());
}

function nativeOpenModelMap(filePath) {
  const n = getAddon();
  if (!n || typeof n.openModelMap !== 'function') return null;
  return n.openModelMap(filePath);
}

function nativeCloseModelMap(modelMap) {
  const n = getAddon();
  if (!n || typeof n.closeModelMap !== 'function' || !modelMap) return false;
  return n.closeModelMap(modelMap.handle || modelMap);
}

function nativeThreads() {
  const v = Number(process.env.AWTAI_THREADS);
  if (Number.isFinite(v) && v > 0) return Math.min(16, Math.floor(v));
  return Math.min(8, Math.max(1, os.cpus().length || 1));
}

function projectWindowRows() {
  const v = Number(process.env.AWTAI_PROJECT_WINDOW_ROWS);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 256;
}

function nativeStatus() {
  const n = getAddon();
  return {
    active: !!n,
    supported: [...SUPPORTED],
    threads: nativeThreads(),
    fusedFfn: !!(n && n.fusedFfn),
    f32Project: !!(n && n.projectF32Rows),
    mmapF32TopK: !!(n && n.mmapF32TopK),
    projectFileRows: !!(n && n.projectFileRows),
    modelMap: !!(n && n.openModelMap && n.closeModelMap),
    error: loadError ? String(loadError.message || loadError) : null
  };
}

module.exports = {
  nativeProjectRows,
  nativeProjectFileRows,
  nativeProjectF32Rows,
  nativeMmapF32TopK,
  nativeFfn,
  nativeOpenModelMap,
  nativeCloseModelMap,
  nativeStatus
};
