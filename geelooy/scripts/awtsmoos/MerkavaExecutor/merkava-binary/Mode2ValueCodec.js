// B"H
const { NATIVE_INDEX, ALL_NATIVE_WORDS } = require('./NativeTables.js');
const TYPE = Object.freeze({ NATIVE: 0, CUSTOM: 1, TRUE: 2, FALSE: 3, SMALL: 4, UNIT: 5, RGB: 6, TEXT: 7 });
const UNITS = ['px','%','em','rem','ms','s','vh','vw','fr'];
function customRef(pool, text) { const v = String(text ?? ''); let i = pool.indexOf(v); if (i < 0) { i = pool.length; pool.push(v); } return i; }
function writeText(w, s) { const b = Buffer.from(String(s ?? ''), 'utf8'); w.varUint(b.length).raw(b); }
function readText(r) { return r.bytes(r.varUint()).toString('utf8'); }
function writeRef(w, pool, value) { const text = String(value ?? ''); if (Object.hasOwn(NATIVE_INDEX, text)) w.u8(TYPE.NATIVE).varUint(NATIVE_INDEX[text]); else w.u8(TYPE.CUSTOM).varUint(customRef(pool, text)); }
function readRef(r, pool) { const t = r.u8(); if (t === TYPE.NATIVE) return ALL_NATIVE_WORDS[r.varUint()] || ''; if (t === TYPE.CUSTOM) return pool[r.varUint()] || ''; throw Error('Bad ref type ' + t); }
function writeValue(w, pool, value) { const text = String(value ?? ''); if (text === 'true') return w.u8(TYPE.TRUE); if (text === 'false') return w.u8(TYPE.FALSE); if (/^\d+$/.test(text) && +text < 128) return w.u8(TYPE.SMALL).varUint(+text); const unit = text.match(/^(\d+)(px|%|em|rem|ms|s|vh|vw|fr)$/); if (unit) return w.u8(TYPE.UNIT).varUint(+unit[1]).varUint(UNITS.indexOf(unit[2])); const rgb = text.match(/^#([0-9a-f]{6})$/i); if (rgb) { const n = parseInt(rgb[1], 16); return w.u8(TYPE.RGB).u8((n>>16)&255).u8((n>>8)&255).u8(n&255); } if (Object.hasOwn(NATIVE_INDEX, text)) return w.u8(TYPE.NATIVE).varUint(NATIVE_INDEX[text]); w.u8(TYPE.CUSTOM).varUint(customRef(pool, text)); }
function readValue(r, pool) { const t = r.u8(); if (t === TYPE.TRUE) return true; if (t === TYPE.FALSE) return false; if (t === TYPE.SMALL) return String(r.varUint()); if (t === TYPE.UNIT) return String(r.varUint()) + UNITS[r.varUint()]; if (t === TYPE.RGB) return `rgb(${r.u8()}, ${r.u8()}, ${r.u8()})`; if (t === TYPE.NATIVE) return ALL_NATIVE_WORDS[r.varUint()] || ''; if (t === TYPE.CUSTOM) return pool[r.varUint()] || ''; throw Error('Bad value type ' + t); }
module.exports = { TYPE, UNITS, writeText, readText, writeRef, readRef, writeValue, readValue, customRef };
