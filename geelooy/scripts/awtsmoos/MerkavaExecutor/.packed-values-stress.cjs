// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');
const { ByteWriter, ByteReader } = MerkavaExecutor;

function round(value) {
  const pool = [];
  const writer = new ByteWriter();
  MerkavaExecutor.encodePackedValue(writer, value, pool, MerkavaExecutor.NATIVE_INDEX);
  return { bytes: writer.toBuffer().length, value: MerkavaExecutor.decodePackedValue(new ByteReader(writer.toBuffer()), pool, MerkavaExecutor.ALL_NATIVE_WORDS), pool };
}

const cases = ['100px', '7em', '50%', '2rem', '90deg', '#ff0033', '#0f0', 'rgb(1, 2, 3)', 'calc(100% - 7em)', 7, 100, true, false];
const results = Object.fromEntries(cases.map(x => [String(x), round(x)]));
assert.strictEqual(results['100px'].bytes, 2);
assert.strictEqual(results['7em'].bytes, 2);
assert.strictEqual(results['50%'].value, '50%');
assert.strictEqual(results['calc(100% - 7em)'].value, 'calc(100% - 7em)');
assert.ok(results['#ff0033'].bytes <= 4);
assert.ok(results['7'].bytes <= 1);

const web = {
  nodes: [{ tag: 'div', id: 'box', text: 'BH' }],
  styles: [{ target: 'box', props: {
    width: '100px', marginLeft: '7em', height: '50%', color: '#ff0033', transform: 'calc(100% - 7em)'
  }}],
  events: []
};
const binary = MerkavaExecutor.encodeWebBinary(web);
const run = MerkavaExecutor.runWebBinary(binary);
assert.strictEqual(run.document.getElementById('box').style.width, '100px');
assert.strictEqual(run.document.getElementById('box').style.marginLeft, '7em');
assert.strictEqual(run.document.getElementById('box').style.height, '50%');
assert.strictEqual(run.document.getElementById('box').style.color, 'rgb(255, 0, 51)');
assert.strictEqual(run.document.getElementById('box').style.transform, 'calc(100% - 7em)');

console.log(JSON.stringify({ ok: true, packedCases: results, webBinaryBytes: binary.length, style: run.document.getElementById('box').style }, null, 2));
