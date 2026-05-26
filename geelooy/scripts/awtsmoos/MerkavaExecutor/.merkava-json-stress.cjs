// B"H
const assert = require('assert');
const { runJsonCode, runJsonAsSang } = require('./merkava-binary');

const program = {
  steps: [
    { op: 'set', name: 'total', value: { op: 'add', args: [{ get: 'seed' }, 12] } },
    { op: 'set', name: 'product', value: { op: 'mul', args: [{ get: 'total' }, 3] } }
  ],
  result: { op: 'sub', args: [{ get: 'product' }, 6] }
};

const direct = runJsonCode(program, { globals: { seed: 5 } });
const packed = runJsonAsSang(program, { globals: { seed: 5 } });
assert.strictEqual(direct.ok, true);
assert.strictEqual(packed.ok, true);
assert.strictEqual(direct.result, 45);
assert.strictEqual(packed.result, 45);
assert.strictEqual(direct.globals.total, 17);
assert.strictEqual(packed.globals.product, 51);

const hostCalls = [];
const sys = runJsonCode({
  steps: [{ op: 'syscall', id: 7, args: ['json', { get: 'seed' }] }]
}, { globals: { seed: 9 }, hostAPI: { 7: (label, value) => hostCalls.push({ label, value }) } });
assert.strictEqual(sys.ok, true);
assert.deepStrictEqual(hostCalls, [{ label: 'json', value: 9 }]);

console.log(JSON.stringify({
  ok: true,
  direct: { result: direct.result, globals: direct.globals },
  packed: { result: packed.result, globals: packed.globals },
  syscalls: hostCalls
}, null, 2));
