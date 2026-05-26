// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

async function run(name, source, expected) {
  const bin = await M.compileToBinary(source, { type: 'js' });
  const result = await M.executeBinary(bin, { globals: {} });
  const actual = result.globals.__awtsmoosResult;
  assert.deepStrictEqual(actual, expected, name);
  return { name, sourceBytes: Buffer.byteLength(source), binaryBytes: bin.length, actual };
}

(async () => {
  const cases = [];

  cases.push(await run('optional-member-call-vm-function', `
    let a = null;
    let x = a?.missing;
    let y = ({ fn(){ return 77; } })?.fn?.();
    __awtsmoosResult = [x, y];
  `, [undefined, 77]));

  cases.push(await run('object-method-this', `
    let obj = { value: 9, add(n){ return this.value + n; } };
    __awtsmoosResult = obj.add(5);
  `, 14));

  cases.push(await run('nested-optional-object-method', `
    let root = { child: { mult(n){ return n * 6; } } };
    let none = {};
    __awtsmoosResult = [root.child?.mult?.(7), none.child?.mult?.(7)];
  `, [42, undefined]));

  cases.push(await run('array-method-callbacks', `
    let xs = [1,2,3,4];
    let mapped = xs.map(v => v * 2);
    let filtered = mapped.filter(v => v > 4);
    __awtsmoosResult = filtered.reduce((a,b)=>a+b,0);
  `, 14));

  cases.push(await run('spread-rest-destructure-combo', `
    function pack(first, ...rest){ return rest.reduce((a,b)=>a+b, first); }
    let [a,,c,...tail] = [3,9,5,7,11];
    let obj = { a, c };
    let merged = {...obj, extra: tail[0]};
    __awtsmoosResult = pack(merged.a, merged.c, merged.extra, tail[1]);
  `, 26));

  cases.push(await run('try-promise-map-json-combo', `
    let x = 0;
    try { throw new Error('BH'); } catch(e) { x += e.message.length; } finally { x += 1; }
    let y = await Promise.resolve(20).then(v => v + x).then(v => v * 2);
    let m = new Map(); m.set('y', y);
    let s = new Set(['ok']);
    let j = JSON.parse('{"bonus":2}');
    __awtsmoosResult = m.get('y') + (s.has('ok') ? j.bonus : 0);
  `, 48));

  const totals = cases.reduce((acc, c) => ({ sourceBytes: acc.sourceBytes + c.sourceBytes, binaryBytes: acc.binaryBytes + c.binaryBytes }), { sourceBytes: 0, binaryBytes: 0 });
  console.log(JSON.stringify({ ok: true, cases, totals }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
