// B"H
const assert = require('assert');
const { encodeCssBits, decodeCssBits } = require('./merkava-binary/Mode2CssBitCodec.js');
const { encodeBitPackedValues, decodeBitPackedValues } = require('./merkava-binary/BitPackedValueCodec.js');

const raw = [800, 1024, 65535];
assert.deepStrictEqual(decodeBitPackedValues(encodeBitPackedValues(raw)), raw);

const pairs = [['fontWeight', '800'], ['opacity', '1']];
const decoded = decodeCssBits(encodeCssBits(pairs), []);
assert.deepStrictEqual(decoded, [['fontWeight', 800], ['opacity', '1']]);
console.log(JSON.stringify({ ok: true, raw, decoded }, null, 2));
