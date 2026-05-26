// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const source = `let a = 7; let b = 5; let xs = [a + b, a * b]; __awtsmoosResult = xs.at(0) + xs.at(1);`;
  const binary = await M.compileToBinary(source, { type: 'js' });
  const run = await M.executeBinary(binary, { globals: {} });
  assert.strictEqual(M.magicOf(binary), 'MD2\0');
  assert.strictEqual(run.result, 47);
  console.log(JSON.stringify({ ok: true, magic: M.magicOf(binary), sourceBytes: Buffer.byteLength(source), binaryBytes: binary.length, result: run.result, arenaBytes: run.arenas.bytes }, null, 2));
})();
