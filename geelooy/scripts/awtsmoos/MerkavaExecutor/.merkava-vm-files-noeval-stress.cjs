// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/lib.js': `
      export const base = 10;
      export function add(a, b) { return a + b; }
      export class A { value(){ return 7; } }
      export class B extends A { value(){ return super.value() + 5; } }
      export function* gen(){ yield 1; yield 2; }
      export function typed(){ return new Uint8Array([3, 4, 5]); }
    `,
    '/main.js': `
      import { base, add, B, gen, typed } from '/lib.js';
      let it = gen();
      let bytes = typed();
      export const result = add(base, new B().value()) + it.next().value + it.next().value + bytes[1];
    `
  };
  const run = await MerkavaExecutor.executeFiles({ files, entry: '/main.js' });
  assert.strictEqual(run.ok, true);
  assert.strictEqual(run.exports.result, 29);
  assert.strictEqual(run.modules['/main.js'].result, 29);

  console.log(JSON.stringify({
    ok: true,
    lane: 'VM_ONLY_FILE_MODULES_NO_SOURCE_EVAL',
    exports: run.exports,
    moduleKeys: Object.keys(run.modules)
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
