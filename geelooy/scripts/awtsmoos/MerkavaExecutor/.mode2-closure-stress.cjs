// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(() => {
  const source = `
function makeAdder(x){ return function(y){ return x + y; }; }
function makeCounter(seed){ let n = seed; return function(step){ n += step; return n; }; }
const add10 = makeAdder(10);
const add100 = makeAdder(100);
const c0 = makeCounter(0);
const c50 = makeCounter(50);
const result = add10(5) + add100(7) + c0(1) + c0(1) + c50(5) + c50(5);
`;
  const binary = M.compileClosureStressProgram();
  const run = M.runClosureProgram(binary);
  assert.strictEqual(run.result, 240);
  assert.deepStrictEqual(run.stack, [240]);
  assert.strictEqual(run.cells.get(2), 2);
  assert.strictEqual(run.cells.get(3), 60);

  const separate = M.encodeClosureProgram([
    { op: M.CLOSURE_OP.MAKE_COUNTER, seed: 0 },
    { op: M.CLOSURE_OP.MAKE_COUNTER, seed: 0 },
    { op: M.CLOSURE_OP.CALL, fn: 0, arg: 3 },
    { op: M.CLOSURE_OP.CALL, fn: 0, arg: 4 },
    { op: M.CLOSURE_OP.CALL, fn: 1, arg: 9 },
    { op: M.CLOSURE_OP.RESULT_SUM, count: 3 }
  ]);
  const separateRun = M.runClosureProgram(separate);
  assert.strictEqual(separateRun.result, 19);
  assert.strictEqual(separateRun.cells.get(0), 7);
  assert.strictEqual(separateRun.cells.get(1), 9);

  console.log(JSON.stringify({
    ok: true,
    feature: 'closures',
    sourceBytes: Buffer.byteLength(source),
    closureBinaryBytes: binary.length,
    savedPercent: Number(((1 - binary.length / Buffer.byteLength(source)) * 100).toFixed(1)),
    result: run.result,
    mutableCells: { counter0: run.cells.get(2), counter50: run.cells.get(3) },
    separateClosureBinaryBytes: separate.length,
    separateClosureResult: separateRun.result,
    ramBytes: run.bytes
  }, null, 2));
})();
