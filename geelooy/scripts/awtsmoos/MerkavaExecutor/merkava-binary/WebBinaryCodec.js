// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { WEB_OPS, WEB_OP_NAMES, WEB_BUILTINS, WEB_BUILTIN_INDEX } = require('./WebBinaryOpcodes.js');
const { encodePackedValue, decodePackedValue } = require('./PackedValueCodec.js');
const MAGIC = 'MWEB';
const VERSION = 3;

function poolIndex(pool, value) {
  const text = value == null ? '' : String(value);
  let index = pool.indexOf(text);
  if (index === -1) { index = pool.length; pool.push(text); }
  return index;
}
function writeRef(writer, pool, value) {
  const text = value == null ? '' : String(value);
  if (Object.prototype.hasOwnProperty.call(WEB_BUILTIN_INDEX, text)) writer.varUint(WEB_BUILTIN_INDEX[text] << 1);
  else writer.varUint((poolIndex(pool, text) << 1) | 1);
}
function readRef(reader, pool) {
  const ref = reader.varUint();
  return (ref & 1) ? (pool[ref >> 1] || '') : (WEB_BUILTINS[ref >> 1] || '');
}
function writeVal(writer, pool, value) { encodePackedValue(writer, value, pool, WEB_BUILTIN_INDEX); }
function readVal(reader, pool) { return decodePackedValue(reader, pool, WEB_BUILTINS); }
function findNodeSeries(nodes) {
  const out = [];
  for (let i = 0; i < nodes.length;) {
    const n = nodes[i];
    const m = String(n.id || '').match(/^([^0-9]+)(\d+)$/);
    const tm = String(n.text || '').match(/^([^0-9]+)(\d+)$/);
    if (!m || !tm || m[2] !== tm[2]) { i++; continue; }
    let count = 1;
    const start = Number(m[2]);
    while (i + count < nodes.length) {
      const x = nodes[i + count];
      if (x.tag !== n.tag || (x.parent || '') !== (n.parent || '')) break;
      if (x.id !== m[1] + (start + count) || x.text !== tm[1] + (start + count)) break;
      count++;
    }
    if (count >= 4) out.push({ index: i, count, tag: n.tag, parent: n.parent || '', idPrefix: m[1], textPrefix: tm[1], start });
    i += Math.max(count, 1);
  }
  return out;
}
function sameProps(a, b) { return JSON.stringify(a || {}) === JSON.stringify(b || {}); }
function findStyleSeries(styles) {
  const out = [];
  for (let i = 0; i < styles.length;) {
    const s = styles[i];
    const m = String(s.target || s.selector || '').match(/^([^0-9]+)(\d+)$/);
    if (!m) { i++; continue; }
    let count = 1;
    const start = Number(m[2]);
    while (i + count < styles.length) {
      const x = styles[i + count];
      if ((x.target || x.selector || '') !== m[1] + (start + count) || !sameProps(x.props, s.props)) break;
      count++;
    }
    if (count >= 4) out.push({ index: i, count, targetPrefix: m[1], start, props: s.props || {} });
    i += Math.max(count, 1);
  }
  return out;
}
function markRanges(series) { const set = new Set(); for (const s of series) for (let i = 0; i < s.count; i++) set.add(s.index + i); return set; }

function encodeWebBinary(ir = {}) {
  const pool = [];
  const code = new ByteWriter();
  const nodeSeries = findNodeSeries(ir.nodes || []);
  const styleSeries = findStyleSeries(ir.styles || []);
  const nodeSkip = markRanges(nodeSeries), styleSkip = markRanges(styleSeries);
  const nodeSeriesByIndex = new Map(nodeSeries.map(s => [s.index, s]));
  const styleSeriesByIndex = new Map(styleSeries.map(s => [s.index, s]));

  for (let i = 0; i < (ir.nodes || []).length; i++) {
    if (nodeSeriesByIndex.has(i)) {
      const s = nodeSeriesByIndex.get(i);
      code.u8(WEB_OPS.CREATE_NODE_SERIES);
      writeRef(code, pool, s.tag || 'div'); writeRef(code, pool, s.parent || ''); writeRef(code, pool, s.idPrefix); writeRef(code, pool, s.textPrefix);
      code.varUint(s.start).varUint(s.count);
    }
    if (nodeSkip.has(i)) continue;
    const node = ir.nodes[i];
    code.u8(WEB_OPS.CREATE_NODE);
    writeRef(code, pool, node.tag || 'div'); writeRef(code, pool, node.id || ''); writeVal(code, pool, node.text || ''); writeRef(code, pool, node.parent || '');
    for (const [attr, value] of Object.entries(node.attrs || {})) {
      if (attr === 'id') continue;
      code.u8(WEB_OPS.SET_ATTR); writeRef(code, pool, node.id || ''); writeRef(code, pool, attr); writeVal(code, pool, value === '' ? true : value);
    }
  }
  for (let i = 0; i < (ir.styles || []).length; i++) {
    if (styleSeriesByIndex.has(i)) {
      const s = styleSeriesByIndex.get(i);
      code.u8(WEB_OPS.SET_STYLE_SERIES);
      writeRef(code, pool, s.targetPrefix); code.varUint(s.start).varUint(s.count);
      const entries = Object.entries(s.props || {}); code.varUint(entries.length);
      for (const [prop, value] of entries) { writeRef(code, pool, prop); writeVal(code, pool, value); }
    }
    if (styleSkip.has(i)) continue;
    const style = ir.styles[i];
    const entries = Object.entries(style.props || {});
    if (entries.length) {
      code.u8(WEB_OPS.SET_STYLE_BLOCK);
      writeRef(code, pool, style.target || style.selector || '');
      code.varUint(entries.length);
      for (const [prop, value] of entries) { writeRef(code, pool, prop); writeVal(code, pool, value); }
    }
  }
  for (const event of ir.events || []) {
    code.u8(WEB_OPS.BIND_EVENT); writeRef(code, pool, event.target); writeRef(code, pool, event.on); code.varUint((event.do || []).length);
    for (const action of event.do || []) {
      if (action.op === 'setText') { code.u8(WEB_OPS.SET_TEXT); writeRef(code, pool, action.target); writeVal(code, pool, action.value); }
      else if (action.op === 'emit') { code.u8(WEB_OPS.EMIT); writeRef(code, pool, action.name); writeVal(code, pool, action.value); }
      else throw new Error(`Unsupported event action: ${action.op}`);
    }
  }
  code.u8(WEB_OPS.END);
  const writer = new ByteWriter();
  writer.raw(Buffer.from(MAGIC, 'ascii')).u8(VERSION).json(pool).bytesWithLength(code.toBuffer());
  return writer.toBuffer();
}

function decodeWebBinary(buffer) {
  const reader = new ByteReader(buffer);
  const magic = reader.bytes(4).toString('ascii');
  if (magic !== MAGIC) throw new Error(`Bad web binary magic: ${magic}`);
  const version = reader.u8();
  const pool = reader.json();
  const code = new ByteReader(reader.bytesWithLength());
  const ops = [];
  while (!code.done()) {
    const op = code.u8();
    if (op === WEB_OPS.END) { ops.push({ op: 'END' }); break; }
    if (op === WEB_OPS.CREATE_NODE) ops.push({ op: 'CREATE_NODE', tag: readRef(code, pool), id: readRef(code, pool), text: readVal(code, pool), parent: readRef(code, pool) });
    else if (op === WEB_OPS.CREATE_NODE_SERIES) {
      const tag = readRef(code, pool), parent = readRef(code, pool), idPrefix = readRef(code, pool), textPrefix = readRef(code, pool), start = code.varUint(), count = code.varUint();
      for (let i = 0; i < count; i++) ops.push({ op: 'CREATE_NODE', tag, id: idPrefix + (start + i), text: textPrefix + (start + i), parent });
    } else if (op === WEB_OPS.SET_ATTR) ops.push({ op: 'SET_ATTR', target: readRef(code, pool), attr: readRef(code, pool), value: readVal(code, pool) });
    else if (op === WEB_OPS.SET_STYLE_BLOCK) {
      const target = readRef(code, pool), propCount = code.varUint(), pairs = [];
      for (let p = 0; p < propCount; p++) pairs.push([readRef(code, pool), readVal(code, pool)]);
      ops.push({ op: 'SET_STYLE_BLOCK', target, pairs });
    }
    else if (op === WEB_OPS.SET_STYLE) ops.push({ op: 'SET_STYLE', target: readRef(code, pool), prop: readRef(code, pool), value: readVal(code, pool) });
    else if (op === WEB_OPS.SET_STYLE_SERIES) {
      const targetPrefix = readRef(code, pool), start = code.varUint(), count = code.varUint(), propCount = code.varUint(), pairs = [];
      for (let p = 0; p < propCount; p++) pairs.push([readRef(code, pool), readVal(code, pool)]);
      for (let i = 0; i < count; i++) for (const [prop, value] of pairs) ops.push({ op: 'SET_STYLE', target: targetPrefix + (start + i), prop, value });
    } else if (op === WEB_OPS.BIND_EVENT) {
      const target = readRef(code, pool), on = readRef(code, pool), count = code.varUint(), actions = [];
      for (let i = 0; i < count; i++) {
        const kind = code.u8();
        if (kind === WEB_OPS.SET_TEXT) actions.push({ op: 'setText', target: readRef(code, pool), value: readVal(code, pool) });
        else if (kind === WEB_OPS.EMIT) actions.push({ op: 'emit', name: readRef(code, pool), value: readVal(code, pool) });
        else throw new Error(`Unknown event action opcode: ${kind}`);
      }
      ops.push({ op: 'BIND_EVENT', target, on, actions });
    } else throw new Error(`Unknown web opcode: ${WEB_OP_NAMES[op] || op}`);
  }
  return { version, pool, ops };
}

module.exports = { encodeWebBinary, decodeWebBinary, MAGIC, VERSION };
