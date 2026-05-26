// B"H
const M = require('./merkavaexecutor.cjs');

(async () => {
  const src = `
    let x = 0;
    try { throw new Error('BH'); } catch(e) { x += e.message.length; } finally { x += 1; }
    let y = await Promise.resolve(20).then(v => v + x).then(v => v * 2);
    let m = new Map(); m.set('y', y);
    let s = new Set(['ok']);
    let j = JSON.parse('{"bonus":2}');
    __awtsmoosResult = [x, y, m.get('y'), s.has('ok'), j.bonus, m.get('y') + (s.has('ok') ? j.bonus : 0)];
  `;
  const bin = await M.compileToBinary(src, { type: 'js' });
  const run = await M.executeBinary(bin, { globals: {} });
  console.log(JSON.stringify({ ok: run.ok, status: run.status, result: run.globals.__awtsmoosResult }, null, 2));
})();
