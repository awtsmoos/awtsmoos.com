// B"H
const M = require('./merkavaexecutor.cjs');

(async () => {
  const src = `
    let x = 3;
    let y = await Promise.resolve(20).then(v => v + x).then(v => v * 2);
    __awtsmoosResult = [x, y];
  `;
  const bin = await M.compileToBinary(src, { type: 'js' });
  const run = await M.executeBinary(bin, { globals: {} });
  console.log(JSON.stringify({ ok: run.ok, status: run.status, result: run.globals.__awtsmoosResult }, null, 2));
})();
