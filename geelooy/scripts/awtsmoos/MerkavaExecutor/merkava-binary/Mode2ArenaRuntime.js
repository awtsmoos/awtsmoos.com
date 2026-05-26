// B"H
/**
 * MODE2 arena runtime: a compact RAM-oriented view of a source app.
 * It avoids one-object-per-node storage by placing DOM-like structure into
 * typed arrays. Strings stay in the shared pool and are referenced by ids.
 */
const { parseHtmlNodes, parseCss, collectLinked } = require('./SourceAppCompiler.js');
const { detectCounterRenderProgram } = require('./CompactModuleBinary.js');

function intern(pool, value) {
  const text = String(value ?? '');
  let id = pool.indexOf(text);
  if (id < 0) { id = pool.length; pool.push(text); }
  return id;
}
function makeNodeArena(nodes = [], pool = []) {
  const n = nodes.length + 1;
  const tag = new Uint16Array(n), id = new Uint16Array(n), text = new Uint16Array(n);
  const parent = new Uint32Array(n), firstChild = new Uint32Array(n), nextSibling = new Uint32Array(n);
  const attrStart = new Uint32Array(n), attrCount = new Uint16Array(n);
  const attrs = [];
  tag[0] = intern(pool, 'body'); id[0] = intern(pool, ''); text[0] = intern(pool, '');
  const byId = new Map([['', 0]]), lastChild = new Map();
  nodes.forEach((node, i) => {
    const ix = i + 1;
    tag[ix] = intern(pool, node.tag || 'div'); id[ix] = intern(pool, node.id || ''); text[ix] = intern(pool, node.text || '');
    if (node.id) byId.set(node.id, ix);
    parent[ix] = byId.get(node.parent || '') || 0;
    const prev = lastChild.get(parent[ix]) || 0;
    if (prev) nextSibling[prev] = ix; else firstChild[parent[ix]] = ix;
    lastChild.set(parent[ix], ix);
    attrStart[ix] = attrs.length;
    for (const [k, v] of Object.entries(node.attrs || {})) if (k !== 'id') attrs.push(intern(pool, k), intern(pool, v === '' ? 'true' : v));
    attrCount[ix] = attrs.length / 2 - attrStart[ix] / 2;
  });
  return { tag, id, text, parent, firstChild, nextSibling, attrStart, attrCount, attrs: Uint16Array.from(attrs), count: n };
}
function makeStyleArena(styles = [], pool = []) {
  const selector = new Uint16Array(styles.length), propStart = new Uint32Array(styles.length), propCount = new Uint16Array(styles.length);
  const props = [];
  styles.forEach((rule, i) => {
    selector[i] = intern(pool, rule.selector || rule.target || ''); propStart[i] = props.length;
    for (const [k, v] of Object.entries(rule.props || {})) props.push(intern(pool, k), intern(pool, v));
    propCount[i] = props.length / 2 - propStart[i] / 2;
  });
  return { selector, propStart, propCount, props: Uint16Array.from(props), count: styles.length };
}
function arenaBytes(arena) {
  let total = 0;
  for (const value of Object.values(arena)) if (value && value.buffer instanceof ArrayBuffer) total += value.byteLength;
  return total;
}
function createMode2ArenaFromSource({ files = {}, entry = '/index.html' } = {}) {
  const html = files[entry] || files[entry.replace(/^\//, '')] || '';
  const linked = collectLinked(html, files, entry);
  const nodes = parseHtmlNodes(html), styles = parseCss(linked.css), program = detectCounterRenderProgram(files);
  const pool = [];
  const dom = makeNodeArena(nodes, pool), style = makeStyleArena(styles, pool);
  const js = program ? {
    base: program.base || 0,
    extra: program.extra || 0,
    yields: Uint16Array.from(program.yields || []),
    labelRef: intern(pool, program.label || ''),
    suffixRef: intern(pool, program.suffix || ''),
    targets: Uint16Array.from((program.targets || []).map(t => intern(pool, t)))
  } : null;
  const poolBytes = Buffer.byteLength(pool.join('\0'));
  return { ok: true, pool, dom, style, js, bytes: { dom: arenaBytes(dom), style: arenaBytes(style), js: js ? js.yields.byteLength + js.targets.byteLength + 8 : 0, pool: poolBytes } };
}
function estimateObjectShapeBytes({ files = {}, entry = '/index.html' } = {}) {
  const html = files[entry] || files[entry.replace(/^\//, '')] || '';
  const linked = collectLinked(html, files, entry);
  const shape = { nodes: parseHtmlNodes(html), styles: parseCss(linked.css), program: detectCounterRenderProgram(files) };
  return Buffer.byteLength(JSON.stringify(shape));
}
module.exports = { intern, makeNodeArena, makeStyleArena, arenaBytes, createMode2ArenaFromSource, estimateObjectShapeBytes };
