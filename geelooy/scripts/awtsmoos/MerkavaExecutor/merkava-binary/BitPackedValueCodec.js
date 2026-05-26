// B"H
const { BitWriter } = require('./BitWriter.js');
const { BitReader } = require('./BitReader.js');
const COMMON_NUMBERS = Object.freeze([0,1,2,3,4,5,6,7,8,9,10,12,14,16,20,24,25,32,36,40,48,50,56,60,64,72,80,90,96,100,120,128]);
const COMMON_INDEX = Object.freeze(Object.fromEntries(COMMON_NUMBERS.map((value, index) => [value, index])));
const UNITS = Object.freeze(['px','%','em','rem','vh','vw','ms','s','deg','fr']);
const UNIT_INDEX = Object.freeze(Object.fromEntries(UNITS.map((value, index) => [value, index])));
const KIND = Object.freeze({ SMALL:0, COMMON:1, UNIT:2, CALC_SUB:3, RGB:4, VAR:5 });

function parseUnit(value) {
  const m = String(value).trim().match(/^(\d+)(px|%|em|rem|vh|vw|ms|s|deg|fr)$/);
  return m ? { n: Number(m[1]), unit: m[2] } : null;
}
function parseCalcSub(value) {
  const m = String(value).replace(/\s+/g, '').match(/^calc\((\d+)(px|%|em|rem|vh|vw|ms|s|deg|fr)-(\d+)(px|%|em|rem|vh|vw|ms|s|deg|fr)\)$/);
  return m ? { a: Number(m[1]), au: m[2], b: Number(m[3]), bu: m[4] } : null;
}
function parseRgb(value) {
  const text = String(value).trim();
  const hex = text.match(/^#([0-9a-fA-F]{6})$/);
  if (hex) return [0,2,4].map(i => parseInt(hex[1].slice(i, i + 2), 16));
  return null;
}
function writeTinyNumber(bits, n) {
  if (n >= 0 && n < 16) return bits.bits(0, 1).bits(n, 4);
  if (COMMON_INDEX[n] !== undefined) return bits.bits(1, 1).bits(COMMON_INDEX[n], 5);
  bits.bits(1, 1).bits(31, 5).bits(n & 255, 8);
}
function readTinyNumber(bits) {
  const isCommon = bits.bits(1);
  if (!isCommon) return bits.bits(4);
  const idx = bits.bits(5);
  return idx === 31 ? bits.bits(8) : COMMON_NUMBERS[idx];
}
function writeBitPackedValue(bits, value) {
  const unit = parseUnit(value);
  const calc = parseCalcSub(value);
  const rgb = parseRgb(value);
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 16) return bits.bits(KIND.SMALL, 3).bits(value, 4);
  if (typeof value === 'number' && COMMON_INDEX[value] !== undefined) return bits.bits(KIND.COMMON, 3).bits(COMMON_INDEX[value], 5);
  if (unit && UNIT_INDEX[unit.unit] !== undefined) { bits.bits(KIND.UNIT, 3).bits(UNIT_INDEX[unit.unit], 4); return writeTinyNumber(bits, unit.n); }
  if (calc) { bits.bits(KIND.CALC_SUB, 3); bits.bits(UNIT_INDEX[calc.au], 4); writeTinyNumber(bits, calc.a); bits.bits(UNIT_INDEX[calc.bu], 4); return writeTinyNumber(bits, calc.b); }
  if (rgb) { bits.bits(KIND.RGB, 3); return bits.bits(rgb[0], 8).bits(rgb[1], 8).bits(rgb[2], 8); }
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 256) return bits.bits(KIND.VAR, 3).bits(value, 8);
  throw new Error(`Cannot bit-pack value: ${value}`);
}
function readBitPackedValue(bits) {
  const kind = bits.bits(3);
  if (kind === KIND.SMALL) return bits.bits(4);
  if (kind === KIND.COMMON) return COMMON_NUMBERS[bits.bits(5)];
  if (kind === KIND.UNIT) { const unit = UNITS[bits.bits(4)]; return `${readTinyNumber(bits)}${unit}`; }
  if (kind === KIND.CALC_SUB) { const au = UNITS[bits.bits(4)], a = readTinyNumber(bits), bu = UNITS[bits.bits(4)], b = readTinyNumber(bits); return `calc(${a}${au} - ${b}${bu})`; }
  if (kind === KIND.RGB) return `rgb(${bits.bits(8)}, ${bits.bits(8)}, ${bits.bits(8)})`;
  if (kind === KIND.VAR) return bits.bits(8);
  throw new Error(`Unknown bit packed kind: ${kind}`);
}
function encodeBitPackedValues(values = []) {
  const bits = new BitWriter();
  bits.bits(values.length, 8);
  for (const value of values) writeBitPackedValue(bits, value);
  return bits.finish();
}
function decodeBitPackedValues(buffer) {
  const bits = new BitReader(buffer);
  const count = bits.bits(8);
  const values = [];
  for (let i = 0; i < count; i++) values.push(readBitPackedValue(bits));
  return values;
}
module.exports = { COMMON_NUMBERS, UNITS, encodeBitPackedValues, decodeBitPackedValues, writeBitPackedValue, readBitPackedValue, parseUnit, parseCalcSub };
