// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { withDb, dbFile } = require('../tools/fs/awdb/open.js');
const C = require('../tools/fs/awdb/collections.js');
const DIR = '.awtsmoos/actions/large-responses';
const DEFAULT_INLINE_BYTES = 384 * 1024;
const DEFAULT_MAX_FILES = 200;
const DEFAULT_MAX_AGE_MS = 12 * 60 * 60 * 1000;
function clamp(n, min, max, fallback) { n = Number(n); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
function inlineLimit() { return clamp(process.env.AWTSMOOS_INLINE_RESPONSE_BYTES, DEFAULT_INLINE_BYTES, 64 * 1024, 8 * 1024 * 1024, DEFAULT_INLINE_BYTES); }
function jsonBytes(value) { try { return Buffer.byteLength(JSON.stringify(value), 'utf8'); } catch { return 0; } }
function compactPreview(value, max = 4000) { try { return JSON.stringify(value).slice(0, max); } catch { return String(value || '').slice(0, max); } }
function responseDir(root) { const dir = path.join(root, DIR); fs.mkdirSync(dir, { recursive: true }); return dir; }
function spillAwdb(root, value, label) {
  const id = `large_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  const text = JSON.stringify(value, null, 2);
  const config = { root, repoRoot: process.cwd() };
  withDb(config, 'responses', db => { const large = C.ensure(db.root, 'largeResponses'); large[id] = { id, at: new Date().toISOString(), label: String(label || 'response'), bytes: Buffer.byteLength(text, 'utf8'), payload: value }; });
  return { ref: `awdb://${id}`, awdbFile: path.relative(root, dbFile(config, 'responses')), bytes: Buffer.byteLength(text, 'utf8'), preview: compactPreview(value) };
}
function prune(root, options = {}) {
  const dir = responseDir(root), now = Date.now();
  const maxFiles = clamp(options.maxFiles || process.env.AWTSMOOS_LARGE_RESPONSE_MAX_FILES, 10, 5000, DEFAULT_MAX_FILES);
  const maxAgeMs = clamp(options.maxAgeMs || process.env.AWTSMOOS_LARGE_RESPONSE_MAX_AGE_MS, 60000, 7 * 86400000, DEFAULT_MAX_AGE_MS);
  const files = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.awtsmoos')).map(e => ({ full: path.join(dir, e.name), mtimeMs: fs.statSync(path.join(dir, e.name)).mtimeMs })).sort((a,b)=>b.mtimeMs-a.mtimeMs);
  let deleted = 0; files.forEach((file, i) => { if (i < maxFiles && now - file.mtimeMs <= maxAgeMs) return; try { fs.unlinkSync(file.full); deleted++; } catch {} });
  return { maxFiles, maxAgeMs, deleted, kept: Math.max(0, files.length - deleted) };
}
function spillFile(root, value, label = 'response') {
  const dir = responseDir(root); prune(root);
  const name = `${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}_${String(label).replace(/[^a-z0-9_-]+/gi, '_')}.awtsmoos`;
  const rel = `${DIR}/${name}`, full = path.join(root, rel), text = JSON.stringify(value, null, 2);
  fs.writeFileSync(full, text, 'utf8'); return { ref: rel, bytes: Buffer.byteLength(text, 'utf8'), preview: compactPreview(value) };
}
function spill(root, value, label = 'response') { try { return { ...spillAwdb(root, value, label), backend: 'awtsmoosdb' }; } catch (error) { return { ...spillFile(root, value, label), backend: 'awtsmoos-file', warning: String(error && error.message || error) }; } }
function compactForSend(root, envelope, options = {}) {
  const limit = clamp(options.limitBytes || inlineLimit(), 16 * 1024, 64 * 1024 * 1024, inlineLimit());
  const bytes = jsonBytes(envelope); if (bytes <= limit) return { envelope, bytes, spilled: false };
  const saved = spill(root, envelope, envelope.action || envelope.type || 'response');
  const compact = { type: envelope.type || 'TUNNEL_RESPONSE', id: envelope.id, ok: envelope.ok !== false, action: envelope.action, partial: true, responseTruncated: true, responseBytes: bytes, inlineLimitBytes: limit, outputRef: saved.ref, outputBackend: saved.backend, outputBytes: saved.bytes, awdbFile: saved.awdbFile, preview: saved.preview, warning: saved.warning, guidance: saved.backend === 'awtsmoosdb' ? 'Response was saved in AwtsmoosDB because it was too large to inline. Use read on outputRef.' : 'Response was saved as an .awtsmoos file. Use read/read64 on outputRef.' };
  return { envelope: compact, bytes: jsonBytes(compact), spilled: true };
}
function readOutputRef(root, ref) {
  const id = String(ref || '').replace(/^awdb:\/\//, '').split(':')[0];
  return withDb({ root, repoRoot: process.cwd() }, 'responses', db => C.plain(C.ensure(db.root, 'largeResponses')[id]));
}
function readOutputText(root, ref, maxChars = 12000, offsetChars = 0) {
  const got = readOutputRef(root, ref); if (!got) throw new Error('awdb_output_ref_not_found: ' + ref);
  const text = JSON.stringify(got.payload, null, 2), offset = clamp(offsetChars, 0, text.length, 0), cap = clamp(maxChars, 0, 8 * 1024 * 1024, 12000), end = cap ? Math.min(text.length, offset + cap) : text.length;
  return { content: text.slice(offset, end), encoding: 'utf8', truncated: end < text.length, offsetChars: offset, returnedChars: end - offset, totalChars: text.length, totalBytes: Buffer.byteLength(text), nextOffsetChars: end < text.length ? end : null, maxChars: cap, outputRef: ref, outputBackend: 'awtsmoosdb' };
}
module.exports = { compactForSend, spill, prune, jsonBytes, inlineLimit, readOutputRef, readOutputText };
