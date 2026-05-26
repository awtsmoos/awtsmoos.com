// B"H
const { BitWriter } = require('./BitWriter.js');
const { BitReader } = require('./BitReader.js');
const { writeBitPackedValue, readBitPackedValue, parseUnit, parseCalcSub } = require('./BitPackedValueCodec.js');

const PROPS = ['display','gap','padding','width','marginLeft','transform','color','borderRadius','userSelect','textTransform','fontWeight','opacity','pointerEvents','marginTop','gridTemplateColumns'];
const VALUES = ['grid','blue','none','auto','uppercase','700','1','pointer','solid','block','flex','100%'];
const PROP_INDEX = Object.freeze(Object.fromEntries(PROPS.map((v, i) => [v, i])));
const VALUE_INDEX = Object.freeze(Object.fromEntries(VALUES.map((v, i) => [v, i])));
const OP = Object.freeze({ END: 0, DECL: 1 });
const VK = Object.freeze({ PACKED: 0, COMMON: 1, CUSTOM: 2 });

function isPackedValue(value) {
  const text = String(value);
  return /^\d+$/.test(text) || !!parseUnit(text) || !!parseCalcSub(text) || /^#[0-9a-f]{6}$/i.test(text);
}
function canEncodeCssBits(pairs = [], pool = []) {
  return pairs.length > 0 && pairs.every(([p, v]) => PROP_INDEX[p] !== undefined && (isPackedValue(v) || VALUE_INDEX[String(v)] !== undefined || pool.indexOf(String(v)) >= 0 && pool.indexOf(String(v)) < 256));
}
function encodeCssBits(pairs = [], pool = []) {
  const bits = new BitWriter();
  for (const [prop, value] of pairs) {
    bits.bits(OP.DECL, 3).bits(PROP_INDEX[prop], 5);
    const text = String(value);
    if (VALUE_INDEX[text] !== undefined) bits.bits(VK.COMMON, 2).bits(VALUE_INDEX[text], 5);
    else if (isPackedValue(text)) { bits.bits(VK.PACKED, 2); writeBitPackedValue(bits, /^\d+$/.test(text) ? Number(text) : text); }
    else bits.bits(VK.CUSTOM, 2).bits(pool.indexOf(text), 8);
  }
  bits.bits(OP.END, 3);
  return bits.finish();
}
function decodeCssBits(buffer = Buffer.alloc(0), pool = []) {
  const bits = new BitReader(buffer), pairs = [];
  while (!bits.done()) {
    const op = bits.bits(3);
    if (op === OP.END) break;
    if (op !== OP.DECL) throw new Error(`Bad CSS bit op ${op}`);
    const prop = PROPS[bits.bits(5)];
    const vk = bits.bits(2);
    let value;
    if (vk === VK.PACKED) value = readBitPackedValue(bits);
    else if (vk === VK.COMMON) value = VALUES[bits.bits(5)];
    else if (vk === VK.CUSTOM) value = pool[bits.bits(8)] || '';
    else throw new Error(`Bad CSS bit value kind ${vk}`);
    pairs.push([prop, value]);
  }
  return pairs;
}
module.exports = { PROPS, VALUES, canEncodeCssBits, encodeCssBits, decodeCssBits };
