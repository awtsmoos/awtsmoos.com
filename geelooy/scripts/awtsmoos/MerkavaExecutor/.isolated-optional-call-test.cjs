// B"H
const M = require('./merkavaexecutor.cjs');

(async () => {
  const src = `
    let a = null;
    let x = a?.missing?.();
    let y = ({ fn(){ return 77; } })?.fn?.();
    __awtsmoosResult = [x, y];
  `;

  const bin = await M.compileToBinary(src, { type: 'js' });
  const run = await M.executeBinary(bin, { globals: {} });

  console.log(JSON.stringify({
    ok: run.ok,
    status: run.status,
    result: run.globals.__awtsmoosResult
  }, null, 2));
})();
