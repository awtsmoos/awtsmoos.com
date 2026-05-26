// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');
const { ByteWriter } = MerkavaExecutor;

const values = [
  0,1,2,3,4,7,8,10,12,16,24,32,50,64,100,128,
  '0px','1px','2px','4px','7em','8px','10px','12px','16px','20px','24px','32px','50%','100%','100px','90deg','2rem','1fr',
  'calc(100% - 7em)','calc(100px - 12px)', '#ff0033', '#00ff00'
];

const bitPacked = MerkavaExecutor.encodeBitPackedValues(values);
const round = MerkavaExecutor.decodeBitPackedValues(bitPacked);
assert.deepStrictEqual(round, values.map(v => typeof v === 'string' && v.startsWith('#') ? v === '#ff0033' ? 'rgb(255, 0, 51)' : 'rgb(0, 255, 0)' : v));

let oldTotal = 0;
for (const value of values) {
  const writer = new ByteWriter();
  MerkavaExecutor.encodePackedValue(writer, value, [], MerkavaExecutor.NATIVE_INDEX);
  oldTotal += writer.toBuffer().length;
}
assert.ok(bitPacked.length < oldTotal, `bit-packed ${bitPacked.length} must beat old typed ${oldTotal}`);

const items = Array.from({ length: 120 }, (_, i) => ({
  tag: 'div', id: `box${i}`, parent: '', text: `Box ${i}`
}));
const styles = Array.from({ length: 120 }, (_, i) => ({
  target: `box${i}`,
  props: {
    width: `${i % 2 ? 100 : 50}%`,
    marginLeft: `${i % 16}px`,
    padding: `${(i % 8) + 1}px`,
    transform: `calc(100% - ${i % 10}em)`,
    color: i % 2 ? '#ff0033' : '#00ff00'
  }
}));
const web = { nodes: items, styles, events: [] };
const bin = MerkavaExecutor.encodeWebBinary(web);
const run = MerkavaExecutor.runWebBinary(bin);
assert.strictEqual(run.document.getElementById('box7').style.transform, 'calc(100% - 7em)');
assert.strictEqual(run.document.getElementById('box7').style.width, '100%');
assert.ok(bin.length < Buffer.byteLength(JSON.stringify(web)), 'binary should beat JSON web IR');

console.log(JSON.stringify({
  ok: true,
  valuesCount: values.length,
  oldTypedBytes: oldTotal,
  bitPackedBytes: bitPacked.length,
  bitSavedPercent: Number(((1 - bitPacked.length / oldTotal) * 100).toFixed(1)),
  insaneWebJsonBytes: Buffer.byteLength(JSON.stringify(web)),
  insaneWebBinaryBytes: bin.length,
  insaneWebSavedPercent: Number(((1 - bin.length / Buffer.byteLength(JSON.stringify(web))) * 100).toFixed(1)),
  sampleStyle: run.document.getElementById('box7').style
}, null, 2));
