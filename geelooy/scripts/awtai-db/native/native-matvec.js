// B"H
const os = require('os');
const path = require('path');

let addon = null;
let loadError = null;
const SUPPORTED = new Set([10, 11, 12, 14]);

function getAddon() {
  if (noNative()) return null;
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
  if (!n || typeof n.projectQkv !== 'function' || !supported3(q, k, v)) return null;
  try { return n.projectQkv(q.raw, q.type, q.rows, k.raw, k.type, k.rows, v.raw, v.type, v.rows, cols, input, nativeThreads()); }
  catch (_) { return null; }
}

function nativeProjectMappedQkv(modelMap, q, k, v, cols, input) {
  const n = getAddon();
  if (!n || typeof n.projectMappedQkv !== 'function' || !modelMap || !supported3(q, k, v)) return null;
  try { return n.projectMappedQkv(modelMap.handle || modelMap, q.offset, q.type, q.rows, k.offset, k.type, k.rows, v.offset, v.type, v.rows, cols, input, nativeThreads()); }
  catch (_) { return null; }
}

function nativeMappedProjectAdd(modelMap, tensor, cols, input, target) {
  const n = getAddon();
  if (!n || typeof n.mappedProjectAdd !== 'function' || !modelMap || !tensor || !SUPPORTED.has(tensor.type)) return false;
  try { return !!n.mappedProjectAdd(modelMap.handle || modelMap, tensor.offset, tensor.type, tensor.rows, cols, input, target, nativeThreads()); }
  catch (_) { return false; }
}

function nativeMappedRmsNorm(modelMap, weight, hidden, input, eps) {
  const n = getAddon();
  if (!n || typeof n.mappedRmsNorm !== 'function' || !modelMap || !weight || weight.type !== 0) return null;
  try { return n.mappedRmsNorm(modelMap.handle || modelMap, weight.offset, weight.type, hidden, input, eps); }
  catch (_) { return null; }
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
  if (!n || typeof n.mappedFfn !== 'function' || !modelMap || !supported3(gate, up, down)) return null;
  try { return n.mappedFfn(modelMap.handle || modelMap, gate.offset, gate.type, up.offset, up.type, down.offset, down.type, hidden, ffn, input, nativeThreads()); }
  catch (_) { return null; }
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

function nativeCreateAttentionSession(layers, capacityTokens, kvSize) {
  const n = getAddon();
  if (!n || typeof n.createAttentionSession !== 'function') return null;
  try { return n.createAttentionSession(layers, capacityTokens, kvSize); }
  catch (_) { return null; }
}

function nativeResetAttentionSession(session) {
  const n = getAddon();
  if (!n || typeof n.resetAttentionSession !== 'function' || !session) return false;
  try { return n.resetAttentionSession(session.handle || session); }
  catch (_) { return false; }
}

function nativeAttentionStep(session, layer, pos, q, k, v, config) {
  const n = getAddon();
  if (!n || typeof n.nativeAttentionStep !== 'function' || !session) return null;
  try {
    return n.nativeAttentionStep(
      session.handle || session, layer, pos, q, k, v,
      config.heads, config.kvHeads, config.headDim, config.kvGroup,
      config.ropeBase, config.ropeScale, config.ropeIsNeox !== false
    );
  } catch (_) { return null; }
}

function supported3(a, b, c) {
  return a && b && c && SUPPORTED.has(a.type) && SUPPORTED.has(b.type) && SUPPORTED.has(c.type);
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

function noNative() {
  return /^(1|true|yes)$/.test(String(process.env.AWTAI_NO_NATIVE || process.env.AWTAI_JS_ONLY || '0'));
}

function nativeStatus() {
  const n = getAddon();
  return {
    active: !!n,
    disabled: noNative(),
    supported: [...SUPPORTED],
    threads: nativeThreads(),
    qkvProject: !!(n && n.projectQkv),
    mappedQkvProject: !!(n && n.projectMappedQkv),
    mappedProjectAdd: !!(n && n.mappedProjectAdd),
    mappedRmsNorm: !!(n && n.mappedRmsNorm),
    fusedFfn: !!(n && n.fusedFfn),
    mappedFfn: !!(n && n.mappedFfn),
    nativeAttention: !!(n && n.createAttentionSession && n.nativeAttentionStep),
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
  nativeMappedProjectAdd,
  nativeMappedRmsNorm,
  nativeProjectFileRows,
  nativeProjectF32Rows,
  nativeMmapF32TopK,
  nativeFfn,
  nativeMappedFfn,
  nativeOpenModelMap,
  nativeCloseModelMap,
  nativeCreateAttentionSession,
  nativeResetAttentionSession,
  nativeAttentionStep,
  nativeStatus
};
