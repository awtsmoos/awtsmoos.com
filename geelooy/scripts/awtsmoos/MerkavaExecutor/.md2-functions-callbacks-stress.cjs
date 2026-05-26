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
  cases.push(await run('function-call', `
    function add(a,b){ return a + b; }
    __awtsmoosResult = add(10, 7);
  `, 17));
  cases.push(await run('arrow-call', `
    let mul = (a,b) => a * b;
    __awtsmoosResult = mul(6, 7);
  `, 42));
  cases.push(await run('array-reduce-arrow', `
    let xs = [1,2,3,4];
    __awtsmoosResult = xs.reduce((a,b)=>a+b, 0);
  `, 10));
  cases.push(await run('array-map-filter-reduce', `
    let xs = [1,2,3,4];
    let ys = xs.map(v => v * 2).filter(v => v > 4);
    __awtsmoosResult = ys.reduce((a,b)=>a+b,0);
  `, 14));
  console.log(JSON.stringify({ ok: true, cases }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
