// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { MODE, HTML, CSS, JS } = require('./ModeOpcodes.js');
const { tokenizeSelector, selectorTextFromTokens } = require('./ModeSelectorCodec.js');
const { createDocumentStub } = require('./WebBinaryRuntime.js');
const { specificity } = require('./CssSelectorEngine.js');
const MAGIC = 'MODE';

function poolRef(pool, text) { const v = String(text || ''); let i = pool.indexOf(v); if (i < 0) { i = pool.length; pool.push(v); } return i; }
function writeStr(w, pool, text) { w.varUint(poolRef(pool, text)); }
function readStr(r, pool) { return pool[r.varUint()] || ''; }
function encodeModeApp({ nodes = [], styles = [], program = null } = {}) {
  const pool = [], w = new ByteWriter();
  w.raw(Buffer.from(MAGIC, 'ascii')).u8(1);
  const body = new ByteWriter();
  body.u8(MODE.HTML).varUint(nodes.length);
  for (const n of nodes) { body.u8(HTML.NODE); writeStr(body, pool, n.tag); writeStr(body, pool, n.id); writeStr(body, pool, n.parent); writeStr(body, pool, n.text); const attrs = Object.entries(n.attrs || {}).filter(([k]) => k !== 'id'); body.varUint(attrs.length); for (const [k, v] of attrs) { writeStr(body, pool, k); writeStr(body, pool, v === '' ? 'true' : v); } }
  body.u8(MODE.CSS).varUint(styles.length);
  for (const s of styles) { body.u8(CSS.RULE); const toks = tokenizeSelector(s.selector || s.target || '', pool); body.varUint(toks.length); for (const t of toks) body.varUint(t); const props = Object.entries(s.props || {}); body.varUint(props.length); for (const [k, v] of props) { writeStr(body, pool, k); writeStr(body, pool, v); } }
  if (program) { body.u8(MODE.JS); body.u8(JS.CLASS_CONST).varUint(program.base || 0); body.u8(JS.FIELD_CONST).varUint(program.extra || 0); body.u8(JS.GEN).varUint((program.yields || []).length); for (const n of program.yields || []) body.varUint(n); body.u8(JS.LABEL); writeStr(body, pool, program.label || ''); if (program.suffix) { body.u8(JS.SUFFIX); writeStr(body, pool, program.suffix); } body.u8(JS.TOTAL); body.u8(JS.RENDER).varUint((program.targets || []).length); for (const t of program.targets || []) writeStr(body, pool, t); }
  body.u8(MODE.END);
  w.json(pool).bytesWithLength(body.toBuffer());
  return w.toBuffer();
}
function decodeModeApp(buffer) { const r = new ByteReader(buffer); if (r.bytes(4).toString('ascii') !== MAGIC) throw Error('Bad MODE magic'); const version = r.u8(), pool = r.json(), body = new ByteReader(r.bytesWithLength()); return { version, pool, body }; }
function setStyle(el, prop, value, score, order) { const old = el.__styleMeta?.[prop]; el.__styleMeta = el.__styleMeta || {}; if (!old || score > old.score || (score === old.score && order >= old.order)) { el.style[prop] = value; el.__styleMeta[prop] = { score, order }; } }
function runModeApp(buffer, options = {}) {
  const app = decodeModeApp(buffer), r = app.body, document = options.document || createDocumentStub(); let mode, order = 0, result;
  const byId = id => id ? document.getElementById(id) : document.body;
  while (!r.done()) { mode = r.u8(); if (mode === MODE.END) break;
    if (mode === MODE.HTML) { const n = r.varUint(); for (let i = 0; i < n; i++) { r.u8(); const el = document.createElement(readStr(r, app.pool)); el.id = readStr(r, app.pool); const parent = readStr(r, app.pool); el.textContent = readStr(r, app.pool); if (el.id) document.byId.set(el.id, el); (byId(parent) || document.body).appendChild(el); const ac = r.varUint(); for (let a = 0; a < ac; a++) el.setAttribute(readStr(r, app.pool), readStr(r, app.pool)); } }
    else if (mode === MODE.CSS) { const n = r.varUint(); for (let i = 0; i < n; i++) { r.u8(); const tc = r.varUint(), toks = []; for (let t = 0; t < tc; t++) toks.push(r.varUint()); const sel = selectorTextFromTokens(toks, app.pool); const pc = r.varUint(), score = specificity(sel), pairs = []; for (let p = 0; p < pc; p++) pairs.push([readStr(r, app.pool), readStr(r, app.pool)]); for (const el of document.querySelectorAll(sel)) for (const [prop, value] of pairs) setStyle(el, prop, value, score, order++); } }
    else if (mode === MODE.JS) { let base = 0, extra = 0, yields = [], label = '', suffix = '', targets = []; while (!r.done()) { const op = r.u8(); if (op === MODE.END) break; if (op === JS.CLASS_CONST) base = r.varUint(); else if (op === JS.FIELD_CONST) extra = r.varUint(); else if (op === JS.GEN) { const c = r.varUint(); yields = Array.from({ length: c }, () => r.varUint()); } else if (op === JS.LABEL) label = readStr(r, app.pool); else if (op === JS.SUFFIX) suffix = readStr(r, app.pool); else if (op === JS.TOTAL) result = `${label}:${base + extra + yields.reduce((a, b) => a + b, 0)}${suffix ? ':' + suffix : ''}`; else if (op === JS.RENDER) { const c = r.varUint(); targets = Array.from({ length: c }, () => readStr(r, app.pool)); for (const id of targets) { const el = byId(id); if (el) el.textContent = result; } } } break; }
  }
  return { ok: true, document, result, app };
}
module.exports = { MAGIC, encodeModeApp, decodeModeApp, runModeApp };
