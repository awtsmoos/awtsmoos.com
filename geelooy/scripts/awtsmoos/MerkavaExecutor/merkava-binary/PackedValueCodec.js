// B"H
/**
 * PackedValueCodec compresses tiny meaning into sub-byte shaped nibbles.
 * The first nybble is a type/category. When the value is small enough,
 * the second nybble carries the whole value in the same byte. Larger values
 * continue as varints. CSS units, colors, calc expressions, booleans, and JS
 * constants all share this one compact vessel.
 */
const UNIT = Object.freeze({ px:0, percent:1, em:2, rem:3, vh:4, vw:5, ms:6, s:7, deg:8, none:15 });
const UNIT_NAME = Object.freeze(Object.fromEntries(Object.entries(UNIT).map(([k, v]) => [v, k === 'percent' ? '%' : k])));
const TYPE = Object.freeze({
  NULL:0x0,
  FALSE:0x1,
  TRUE:0x2,
  SMALL_UINT:0x3,
  VAR_UINT:0x4,
  SMALL_INT:0x5,
  STRING_REF:0x6,
  NATIVE_REF:0x7,
  UNIT_SMALL:0x8,
  UNIT_VAR:0x9,
  RGB:0xA,
  CALC:0xB,
  RAW_STRING:0xC
});
const CALC_OP = Object.freeze({ '+':0, '-':1, '*':2, '/':3 });
const CALC_OP_NAME = Object.freeze(Object.fromEntries(Object.entries(CALC_OP).map(([k, v]) => [v, k])));

function writeNibbleByte(writer, type, low = 0) { writer.u8(((type & 15) << 4) | (low & 15)); }
function readHeader(reader) { const b = reader.u8(); return { type: b >> 4, low: b & 15 }; }
function asText(value) { return value == null ? '' : String(value); }
function poolIndex(pool, value) {
  const text = asText(value);
  let index = pool.indexOf(text);
  if (index === -1) { index = pool.length; pool.push(text); }
  return index;
}
function parseNumericUnit(value) {
  const m = asText(value).trim().match(/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vh|vw|ms|s|deg)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n)) return null;
  return { n, unit: m[2] === '%' ? 'percent' : m[2] };
}
function parseColor(value) {
  const text = asText(value).trim();
  const short = text.match(/^#([0-9a-fA-F]{3})$/);
  if (short) return short[1].split('').map(x => parseInt(x + x, 16));
  const full = text.match(/^#([0-9a-fA-F]{6})$/);
  if (full) return [0, 2, 4].map(i => parseInt(full[1].slice(i, i + 2), 16));
  const rgb = text.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}
function parseCalc(value) {
  const text = asText(value).replace(/\s+/g, '');
  const m = text.match(/^calc\((.+?)([+\-*/])(.+)\)$/);
  if (!m) return null;
  const left = parseNumericUnit(m[1]);
  const right = parseNumericUnit(m[3]);
  if (!left || !right) return null;
  return { left, op: m[2], right };
}

function encodePackedValue(writer, value, pool = [], nativeIndex = {}) {
  if (value == null) return writeNibbleByte(writer, TYPE.NULL);
  if (value === false) return writeNibbleByte(writer, TYPE.FALSE);
  if (value === true) return writeNibbleByte(writer, TYPE.TRUE);
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 16) return writeNibbleByte(writer, TYPE.SMALL_UINT, value);
  if (typeof value === 'number' && Number.isInteger(value) && value >= -8 && value <= 7) return writeNibbleByte(writer, TYPE.SMALL_INT, value + 8);
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) { writeNibbleByte(writer, TYPE.VAR_UINT); return writer.varUint(value); }
  const calc = parseCalc(value);
  if (calc) {
    writeNibbleByte(writer, TYPE.CALC, CALC_OP[calc.op]);
    encodePackedValue(writer, `${calc.left.n}${UNIT_NAME[UNIT[calc.left.unit]]}`, pool, nativeIndex);
    return encodePackedValue(writer, `${calc.right.n}${UNIT_NAME[UNIT[calc.right.unit]]}`, pool, nativeIndex);
  }
  const unit = parseNumericUnit(value);
  if (unit) {
    const unitId = UNIT[unit.unit];
    if (unit.n >= 0 && unit.n < 16 && unitId < 16) { writeNibbleByte(writer, TYPE.UNIT_SMALL, unitId); return writer.u8(unit.n & 15); }
    writeNibbleByte(writer, TYPE.UNIT_VAR, unitId); return writer.varUint(unit.n < 0 ? ((-unit.n) << 1) | 1 : unit.n);
  }
  const rgb = parseColor(value);
  if (rgb) { writeNibbleByte(writer, TYPE.RGB); return writer.u8(rgb[0]).u8(rgb[1]).u8(rgb[2]); }
  const text = asText(value);
  if (Object.prototype.hasOwnProperty.call(nativeIndex, text)) { writeNibbleByte(writer, TYPE.NATIVE_REF); return writer.varUint(nativeIndex[text]); }
  writeNibbleByte(writer, TYPE.STRING_REF);
  return writer.varUint(poolIndex(pool, text));
}

function decodePackedValue(reader, pool = [], nativeWords = []) {
  const { type, low } = readHeader(reader);
  if (type === TYPE.NULL) return null;
  if (type === TYPE.FALSE) return false;
  if (type === TYPE.TRUE) return true;
  if (type === TYPE.SMALL_UINT) return low;
  if (type === TYPE.SMALL_INT) return low - 8;
  if (type === TYPE.VAR_UINT) return reader.varUint();
  if (type === TYPE.STRING_REF) return pool[reader.varUint()] || '';
  if (type === TYPE.NATIVE_REF) return nativeWords[reader.varUint()] || '';
  if (type === TYPE.UNIT_SMALL) return `${reader.u8() & 15}${UNIT_NAME[low] || ''}`;
  if (type === TYPE.UNIT_VAR) { const raw = reader.varUint(); const n = raw; return `${n}${UNIT_NAME[low] || ''}`; }
  if (type === TYPE.RGB) return `rgb(${reader.u8()}, ${reader.u8()}, ${reader.u8()})`;
  if (type === TYPE.CALC) return `calc(${decodePackedValue(reader, pool, nativeWords)} ${CALC_OP_NAME[low]} ${decodePackedValue(reader, pool, nativeWords)})`;
  if (type === TYPE.RAW_STRING) return reader.string();
  throw new Error(`Unknown packed value type ${type}`);
}

module.exports = { TYPE, UNIT, CALC_OP, encodePackedValue, decodePackedValue, parseNumericUnit, parseColor, parseCalc };
