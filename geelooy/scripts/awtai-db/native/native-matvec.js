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

function nativeProjectQkv(q, k, v, cols, input) {
  const n = getAddon();
  if (!n || typeof n.projectQkv !== 'function') return null;
  if (!q || !k || !v) return null;
  if (!SUPPORTED.has(q.type) || !SUPPORTED.has(k.type) || !SUPPORTED.has(v.type)) return null;
  try { return n.projectQkv(q.raw, q.type, q.rows, k.raw, k.type, k.rows, v.raw, v.type, v.rows, cols, input, nativeThreads()); }
  catch (_) { return null; }
}

function nativeProjectMappedQkv(modelMap, q, k, v, cols, input) {
  const n = getAddon();
  if (!n || typeof n.projectMappedQkv !== 'function' || !modelMap) return null;
  if (!q || !k || !v) return null;
  if (!SUPPORTED.has(q.type) || !SUPPORTED.has(k.type) || !SUPPORTED.has(v.type)) return null;
  try {
    return n.projectMappedQkv(modelMap.handle || modelMap, q.offset, q.type, q.rows, k.offset, k.type, k.rows, v.offset, v.type, v.rows, cols, input, nativeThreads());
  } catch (_) { return null; }
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

function nativeMappedFfn(modelMap, gate, up, down, hidden, ffn, input) {
  const n = getAddon();
  if (!n || typeof n.mappedFfn !== 'function' || !modelMap) return null;
  if (!gate || !up || !down) return null;
  if (!SUPPORTED.has(gate.type) || !SUPPORTED.has(up.type) || !SUPPORTED.has(down.type)) return null;
  try {
    return n.mappedFfn(modelMap.handle || modelMap, gate.offset, gate.type, up.offset, up.type, down.offset, down.type, hidden, ffn, input, nativeThreads());
  } catch (_) { return null; }
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
    qkvProject: !!(n && n.projectQkv),
    mappedQkvProject: !!(n && n.projectMappedQkv),
    fusedFfn: !!(n && n.fusedFfn),
    mappedFfn: !!(n && n.mappedFfn),
    f32Project: !!(n && n.projectF32Rows),
    mmapF32TopK: !!(n && n.mmapF32TopK),
    projectFileRows: !!(n && n.projectFileRows),
    modelMap: !!(n && n.openModelMap && n.closeModelMap),
    error: loadError ? String(loadError.message || loadError) : null
  };
}

module.exports = {
  nativeProjectRows,
  nativeProjectQkv,
  nativeProjectMappedQkv,
  nativeProjectFileRows,
  nativeProjectF32Rows,
  nativeMmapF32TopK,
  nativeFfn,
  nativeMappedFfn,
  nativeOpenModelMap,
  nativeCloseModelMap,
  nativeStatus
};
