// B"H
/** Build typed-array arenas directly from MD2 bytes. */
const { decodeMode2App, MODE2_OP } = require('./Mode2AppBinary.js');
const { readRef, readValue } = require('./Mode2ValueCodec.js');
const { decodeCssBits } = require('./Mode2CssBitCodec.js');
const { decodeJsBits, decodeJsScopeBits } = require('./Mode2JsBitCodec.js');
const { buildPoolBytes, poolBytesSize, makeLazyPool } = require('./Mode2PoolBytes.js');

function intern(pool, value) {
  const text = String(value ?? '');
  let id = pool.indexOf(text);
  if (id < 0) { id = pool.length; pool.push(text); }
  return id;
}
function readAttrs(r, srcPool, pool) {
  const attrs = [], n = r.varUint();
  for (let i = 0; i < n; i++) attrs.push([intern(pool, readRef(r, srcPool)), intern(pool, readValue(r, srcPool))]);
  return attrs;
}
function makeArenaState() {
  return { pool: [], tag: [], id: [], text: [], parent: [], firstChild: [], nextSibling: [], attrStart: [], attrCount: [], attrs: [], byId: new Map([['', 0]]), lastChild: new Map() };
}
function appendNode(st, tag, id, parent, text, attrs = []) {
  const ix = st.tag.length;
  st.tag.push(intern(st.pool, tag)); st.id.push(intern(st.pool, id)); st.text.push(intern(st.pool, text));
  const parentIndex = st.byId.get(parent || '') || 0;
  st.parent.push(parentIndex); st.firstChild.push(0); st.nextSibling.push(0);
  if (id) st.byId.set(id, ix);
  const prev = st.lastChild.get(parentIndex) || 0;
  if (prev) st.nextSibling[prev] = ix; else st.firstChild[parentIndex] = ix;
  st.lastChild.set(parentIndex, ix);
  st.attrStart.push(st.attrs.length);
  for (const [k, v] of attrs) st.attrs.push(k, v);
  st.attrCount.push(attrs.length);
}
function initBody(st) { appendNode(st, 'body', '', '', '', []); }
function freezeDom(st) {
  return { tag: Uint16Array.from(st.tag), id: Uint16Array.from(st.id), text: Uint16Array.from(st.text), parent: Uint32Array.from(st.parent), firstChild: Uint32Array.from(st.firstChild), nextSibling: Uint32Array.from(st.nextSibling), attrStart: Uint32Array.from(st.attrStart), attrCount: Uint16Array.from(st.attrCount), attrs: Uint16Array.from(st.attrs), count: st.tag.length };
}
function bytesOf(obj) { let n = 0; for (const v of Object.values(obj)) if (v?.buffer instanceof ArrayBuffer) n += v.byteLength; return n; }
function readTemplate(r, app, pool) { return { tag: readRef(r, app.pool), parent: readRef(r, app.pool), attrs: readAttrs(r, app.pool, pool) }; }
function readSingleNode(r, app, st) { appendNode(st, readRef(r, app.pool), readRef(r, app.pool), readRef(r, app.pool), readValue(r, app.pool), readAttrs(r, app.pool, st.pool)); }
function readTemplateNode(r, app, st, templates) { const t = templates[r.varUint()]; appendNode(st, t.tag, readRef(r, app.pool), t.parent, readValue(r, app.pool), t.attrs); }
function readRepeat(r, app, st) {
  const tag = readRef(r, app.pool), parent = readRef(r, app.pool), idPrefix = readRef(r, app.pool), start = r.varUint(), count = r.varUint();
  const textPrefix = readRef(r, app.pool), textStart = r.varUint(), attrs = readAttrs(r, app.pool, st.pool);
  for (let i = 0; i < count; i++) appendNode(st, tag, idPrefix + (start + i), parent, textPrefix ? textPrefix + (textStart + i) : '', attrs);
}
function readNodes(app, r, st) {
  initBody(st);
  const templates = [], tc = r.varUint();
  for (let i = 0; i < tc; i++) templates.push(readTemplate(r, app, st.pool));
  const nc = r.varUint();
  for (let i = 0; i < nc; i++) {
    const op = r.u8();
    if (op === MODE2_OP.NODE) readSingleNode(r, app, st);
    else if (op === MODE2_OP.REPEAT_NODE) readRepeat(r, app, st);
    else if (op === MODE2_OP.TEMPLATE_NODE) readTemplateNode(r, app, st, templates);
    else if (op === MODE2_OP.TEMPLATE_STREAM) { const n = r.varUint(); for (let j = 0; j < n; j++) readTemplateNode(r, app, st, templates); }
    else throw new Error(`Bad arena node op ${op}`);
  }
}
function readStyles(app, r, pool) {
  const selector = [], propStart = [], propCount = [], props = [], sc = r.varUint();
  for (let i = 0; i < sc; i++) {
    const op = r.u8();
    if (op === MODE2_OP.STYLE_STREAM_BITS) {
      const count = r.varUint();
      for (let j = 0; j < count; j++) pushStyle(app.selectors[r.varUint()] || '', decodeCssBits(r.bytesWithLength(), app.pool));
    } else {
      const sid = r.varUint();
      if (op === MODE2_OP.STYLE_BITS) pushStyle(app.selectors[sid] || '', decodeCssBits(r.bytesWithLength(), app.pool));
      else { const pairs = [], pc = r.varUint(); for (let p = 0; p < pc; p++) pairs.push([readRef(r, app.pool), readValue(r, app.pool)]); pushStyle(app.selectors[sid] || '', pairs); }
    }
  }
  function pushStyle(sel, pairs) { selector.push(intern(pool, sel)); propStart.push(props.length); for (const [k, v] of pairs) props.push(intern(pool, k), intern(pool, v)); propCount.push(pairs.length); }
  return { selector: Uint16Array.from(selector), propStart: Uint32Array.from(propStart), propCount: Uint16Array.from(propCount), props: Uint16Array.from(props), count: selector.length };
}
function readProgram(app, r, pool) {
  while (!r.done()) {
    const op = r.u8();
    if (op === MODE2_OP.END) break;
    if (op === MODE2_OP.JS_SCOPE_BITS || op === MODE2_OP.JS_BITS) {
      const packed = op === MODE2_OP.JS_SCOPE_BITS ? decodeJsScopeBits(r.bytesWithLength(), app.pool) : decodeJsBits(r.bytesWithLength(), app.pool);
      return { resultRef: intern(pool, packed.result), targets: Uint16Array.from(packed.targets.map(t => intern(pool, t))) };
    }
    if (op === MODE2_OP.JS) {
      const kind = r.u8();
      if (kind === 1) return { resultRef: intern(pool, readValue(r, app.pool)), targets: Uint16Array.from([intern(pool, readRef(r, app.pool))]) };
    }
  }
  return null;
}
function createMode2ArenaFromBinary(buffer) {
  const app = decodeMode2App(buffer), r = app.body, st = makeArenaState();
  readNodes(app, r, st);
  const style = readStyles(app, r, st.pool);
  const js = readProgram(app, r, st.pool);
  const dom = freezeDom(st);
  const poolBytes = buildPoolBytes(st.pool);
  const lazyPool = makeLazyPool(poolBytes);
  const bytes = { dom: bytesOf(dom), style: bytesOf(style), js: js ? js.targets.byteLength + 2 : 0, pool: poolBytesSize(poolBytes) };
  return { ok: true, source: 'md2-binary', pool: lazyPool, poolBytes, debugPool: st.pool, dom, style, js, bytes };
}
module.exports = { createMode2ArenaFromBinary };
