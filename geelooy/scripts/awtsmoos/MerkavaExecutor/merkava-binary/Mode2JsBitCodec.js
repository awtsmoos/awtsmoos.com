// B"H
const { BitWriter } = require('./BitWriter.js');
const { BitReader } = require('./BitReader.js');

const OP = Object.freeze({ END: 0, BASE: 1, EXTRA: 2, YIELD: 3, LABEL: 4, SUFFIX: 5, TARGET: 6, RENDER: 7 });

function needsBits(program = {}) {
  return program && !program.setText && Array.isArray(program.yields) && Array.isArray(program.targets);
}
function writeTiny(bits, value) {
  const n = Number(value || 0);
  if (n >= 0 && n < 16) bits.bits(0, 1).bits(n, 4);
  else bits.bits(1, 1).bits(n, 8);
}
function readTiny(bits) { return bits.bits(1) ? bits.bits(8) : bits.bits(4); }
function encodeJsBits(program = {}, pool = []) {
  const bits = new BitWriter();
  bits.bits(OP.BASE, 3); writeTiny(bits, program.base || 0);
  bits.bits(OP.EXTRA, 3); writeTiny(bits, program.extra || 0);
  for (const y of program.yields || []) { bits.bits(OP.YIELD, 3); writeTiny(bits, y); }
  bits.bits(OP.LABEL, 3); writeTiny(bits, pool.indexOf(String(program.label || '')));
  if (program.suffix) { bits.bits(OP.SUFFIX, 3); writeTiny(bits, pool.indexOf(String(program.suffix))); }
  for (const t of program.targets || []) { bits.bits(OP.TARGET, 3); writeTiny(bits, pool.indexOf(String(t))); }
  bits.bits(OP.RENDER, 3).bits(OP.END, 3);
  return bits.finish();
}
function decodeJsBits(buffer = Buffer.alloc(0), pool = []) {
  const bits = new BitReader(buffer); let label = '', suffix = '', targets = [], sum = 0;
  while (!bits.done()) {
    const op = bits.bits(3);
    if (op === OP.END) break;
    if (op === OP.BASE || op === OP.EXTRA || op === OP.YIELD) sum += readTiny(bits);
    else if (op === OP.LABEL) label = pool[readTiny(bits)] || '';
    else if (op === OP.SUFFIX) suffix = pool[readTiny(bits)] || '';
    else if (op === OP.TARGET) targets.push(pool[readTiny(bits)] || '');
    else if (op === OP.RENDER) return { result: `${label}:${sum}${suffix ? ':' + suffix : ''}`, targets };
  }
  return { result: `${label}:${sum}${suffix ? ':' + suffix : ''}`, targets };
}
function encodeJsScopeBits(program = {}, pool = []) {
  const bits = new BitWriter();
  writeTiny(bits, program.base || 0);
  writeTiny(bits, program.extra || 0);
  bits.bits((program.yields || []).length, 3);
  for (const y of program.yields || []) writeTiny(bits, y);
  writeTiny(bits, pool.indexOf(String(program.label || '')));
  bits.bits(program.suffix ? 1 : 0, 1);
  if (program.suffix) writeTiny(bits, pool.indexOf(String(program.suffix)));
  bits.bits((program.targets || []).length, 3);
  for (const t of program.targets || []) writeTiny(bits, pool.indexOf(String(t)));
  return bits.finish();
}
function decodeJsScopeBits(buffer = Buffer.alloc(0), pool = []) {
  const bits = new BitReader(buffer); let sum = 0;
  sum += readTiny(bits); sum += readTiny(bits);
  const yc = bits.bits(3);
  for (let i = 0; i < yc; i++) sum += readTiny(bits);
  const label = pool[readTiny(bits)] || '';
  const suffix = bits.bits(1) ? (pool[readTiny(bits)] || '') : '';
  const tc = bits.bits(3), targets = [];
  for (let i = 0; i < tc; i++) targets.push(pool[readTiny(bits)] || '');
  return { result: `${label}:${sum}${suffix ? ':' + suffix : ''}`, targets };
}
module.exports = { JS_BIT_OP: OP, needsBits, encodeJsBits, decodeJsBits, encodeJsScopeBits, decodeJsScopeBits };
