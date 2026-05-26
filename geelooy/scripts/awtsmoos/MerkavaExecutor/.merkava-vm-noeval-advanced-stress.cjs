// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

async function run(source, globals = {}) {
  const packed = await MerkavaExecutor.compileToBinary(source, { type: 'js' });
  assert.strictEqual(MerkavaExecutor.magicOf(packed), 'SANG');
  return MerkavaExecutor.executeBinary(packed, { globals });
}

(async () => {
  const arrayObj = await run(`
    let arr = [3, 4, 5];
    let obj = { a: arr[0], b: arr[1] };
    obj.c = arr[2];
    __awtsmoosResult = obj.a + obj.b + obj.c;
  `);
  assert.strictEqual(arrayObj.globals.__awtsmoosResult, 12);

  const functions = await run(`
    function add(a, b) { return a + b; }
    let value = add(20, 22);
    __awtsmoosResult = value;
  `);
  assert.strictEqual(functions.globals.__awtsmoosResult, 42);

  const typed = await run(`
    let bytes = new Uint8Array([40, 2]);
    __awtsmoosResult = bytes[0] + bytes[1];
  `);
  assert.strictEqual(typed.globals.__awtsmoosResult, 42);

  const classGenAsync = await run(`
    class A { value(){ return 7; } }
    class B extends A { value(){ return super.value() + 5; } }
    function* g(){ yield 10; yield 20; }
    async function f(){ return await 10; }
    let it = g();
    __awtsmoosResult = new B().value() + it.next().value + it.next().value + await f();
  `);
  assert.strictEqual(classGenAsync.globals.__awtsmoosResult, 52);

  const logic = await run(`
    let a = 3;
    let b = 4;
    __awtsmoosResult = (a < b && b === 4) ? 42 : 0;
  `);
  assert.strictEqual(logic.globals.__awtsmoosResult, 42);

  console.log(JSON.stringify({
    ok: true,
    lane: 'VM_ONLY_SANG_NO_SOURCE_EVAL',
    cases: {
      arrayObjectPropertySet: arrayObj.globals.__awtsmoosResult,
      functionsWithArgs: functions.globals.__awtsmoosResult,
      typedArray: typed.globals.__awtsmoosResult,
      classGeneratorAsync: classGenAsync.globals.__awtsmoosResult,
      logicConditional: logic.globals.__awtsmoosResult
    }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
