// B"H
const { parseXmlWrites } = require('./xmlWrites.js');

const CARRIERS = ['params','content','body','query','goal','text','data','payload','writes','files','writesJson','filesJson','json','input'];
const PATH_KEYS = ['path','p','file','filePath','filename','name','target','dest'];
const CONTENT_KEYS = ['content','text','body','value','data','source','contents'];

/**
 * B"H
 * Chapter 517: Bulk write stopped mistaking the room for the scroll.
 * A default path of '.' is routing context, not a file write. Carriers named
 * writes/files now win before path aliases, so JSON arrays, maps, nested params,
 * and ordinary POST payloads become whole-file writes instead of EISDIR storms.
 */
function number(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}
function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return value;
  try { return JSON.parse(text); } catch { return value; }
}
function normalizeWrites(payload = {}) {
  if (Array.isArray(payload)) return payload.map(normalizeWrite).filter(Boolean);
  const xmlWrites = parseXmlWrites(payload);
  if (xmlWrites.length) return xmlWrites.map(normalizeWrite).filter(Boolean);
  return directWrites(fusedWritePayload(payload)).map(normalizeWrite).filter(Boolean);
}
function describeWritePayload(payload = {}) {
  const xmlWrites = Array.isArray(payload) ? [] : parseXmlWrites(payload);
  const fused = Array.isArray(payload) ? { writes: payload } : fusedWritePayload(payload);
  return { carrierKeys: Array.isArray(payload) ? ['<array>'] : CARRIERS.filter(key => payload[key] !== undefined), xmlWriteCount: xmlWrites.length, fusedKeys: Object.keys(fused).sort(), writeCount: normalizeWrites(payload).length };
}
function fusedWritePayload(payload = {}) {
  const out = mergeObject({}, payload);
  for (const key of CARRIERS) absorbCarrier(out, payload[key], key);
  return out;
}
function absorbCarrier(out, value, key = '') {
  const parsed = parseMaybeJson(value);
  if (parsed === undefined || parsed === null || parsed === '') return;
  if (Array.isArray(parsed)) { out.writes = parsed; return; }
  if (typeof parsed === 'object') { mergeObject(out, parsed); return; }
  if (key === 'writes' || key === 'files') out[key] = parsed;
}
function mergeObject(out, got) {
  if (!got || typeof got !== 'object' || Array.isArray(got)) return out;
  for (const [key, value] of Object.entries(got)) {
    const parsed = parseMaybeJson(value);
    if (['params','payload','input'].includes(key)) absorbCarrier(out, parsed, key);
    else out[key] = parsed;
  }
  return out;
}
function directWrites(fused) {
  const writes = parseMaybeJson(fused.writes ?? fused.files ?? fused.fileWrites ?? fused.changes);
  if (Array.isArray(writes)) return writes;
  if (writes && typeof writes === 'object') return mapToWrites(writes);
  const pathValue = firstKey(fused, PATH_KEYS);
  const contentValue = firstKey(fused, CONTENT_KEYS);
  if (pathValue && contentValue !== '') return [fused];
  return [];
}
function mapToWrites(map) {
  return Object.entries(map).map(([filePath, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return { path: filePath, ...value };
    return { path: filePath, content: value };
  });
}
function normalizeWrite(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const pathValue = firstKey(entry, PATH_KEYS);
  if (!pathValue || pathValue === '.') return null;
  const contentValue = firstKey(entry, CONTENT_KEYS);
  return { path: String(pathValue), content: String(contentValue ?? '') };
}
function firstKey(object, keys) {
  for (const key of keys) if (object[key] !== undefined && object[key] !== null) return object[key];
  return '';
}
module.exports = { CARRIERS, PATH_KEYS, CONTENT_KEYS, number, parseMaybeJson, normalizeWrites, describeWritePayload, fusedWritePayload, normalizeWrite };
