// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

async function run(name, source, expected) {
  const packed = await M.compileToBinary(source, { type: 'js' });
  assert.strictEqual(M.magicOf(packed), 'SANG');
  const result = await M.executeBinary(packed, { globals: {} });
  assert.strictEqual(result.globals.__awtsmoosResult, expected, name);
  return { name, bytes: Buffer.byteLength(source), binary: packed.length, result: result.globals.__awtsmoosResult };
}

(async () => {
  const cases = [];
  cases.push(await run('closure-mutability', `
    function maker(seed){ let n = seed; return function(step){ n += step; return n; }; }
    let a = maker(0); let b = maker(10);
    __awtsmoosResult = a(1) + a(2) + b(5) + b(5);
  `, 39));

  cases.push(await run('destructure-spread-rest', `
    function sum(...xs){ return xs.reduce((a,b)=>a+b,0); }
    let [a,,c] = [5, 9, 7];
    let obj = {x: 10, y: 20};
    let z = {...obj, y: 22};
    __awtsmoosResult = sum(a, c, z.y);
  `, 34));

  cases.push(await run('try-catch-finally', `
    let x = 0;
    try { throw new Error('BH'); } catch(e) { x += e.message.length; } finally { x += 40; }
    __awtsmoosResult = x;
  `, 42));

  cases.push(await run('promise-chain', `
    let x = await Promise.resolve(20).then(v => v + 1).then(v => v * 2);
    __awtsmoosResult = x;
  `, 42));

  cases.push(await run('map-set-json', `
    let m = new Map(); m.set('a', 20); m.set('b', 22);
    let s = new Set(['a','c']);
    let obj = JSON.parse('{"x":40}');
    __awtsmoosResult = m.get('a') + (s.has('c') ? 2 : 0) + (JSON.stringify(obj).includes('40') ? 20 : 0);
  `, 42));

  const totals = cases.reduce((acc, c) => ({ source: acc.source + c.bytes, binary: acc.binary + c.binary }), { source: 0, binary: 0 });
  console.log(JSON.stringify({ ok: true, cases, totals, savedPercent: Number(((1 - totals.binary / totals.source) * 100).toFixed(1)) }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
