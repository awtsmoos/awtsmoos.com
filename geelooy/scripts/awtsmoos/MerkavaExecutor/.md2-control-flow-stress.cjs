// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

async function run(name, source, expected) {
  const binary = await M.compileToBinary(source, { type: 'js' });
  assert.strictEqual(M.magicOf(binary), 'MD2\0', `${name}: magic`);
  assert.strictEqual(Buffer.from(binary)[4], 74, `${name}: JS section`);
  const result = await M.executeBinary(binary, { globals: {} });
  assert.deepStrictEqual(result.result, expected, `${name}: result`);
  return { name, sourceBytes: Buffer.byteLength(source), binaryBytes: binary.length, result: result.result, arenaBytes: result.arenas.bytes };
}

(async () => {
  const cases = [];
  cases.push(await run('if-else', `
    let x = 5;
    if (x > 3) { __awtsmoosResult = 10; } else { __awtsmoosResult = 1; }
  `, 10));
  cases.push(await run('while-loop-compound', `
    let i = 0; let sum = 0;
    while (i < 6) { sum += i; i += 1; }
    __awtsmoosResult = sum;
  `, 15));
  cases.push(await run('for-loop', `
    let sum = 0;
    for (let i = 0; i < 5; i += 1) { sum += i * 2; }
    __awtsmoosResult = sum;
  `, 20));
  cases.push(await run('nested-if-loop', `
    let i = 0; let sum = 0;
    while (i < 8) { if (i > 3) { sum += i; } i += 1; }
    __awtsmoosResult = sum;
  `, 22));
  console.log(JSON.stringify({ ok: true, cases }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
