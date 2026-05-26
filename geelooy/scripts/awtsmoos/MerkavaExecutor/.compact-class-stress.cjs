// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const classes = `
class BaseA { value(){ return 10; } }
class ChildA extends BaseA {
  constructor(){ super(); this.secret = 32; }
  total(){ return super.value() + this.secret; }
}
class BaseB { value(){ return 2; } }
class ChildB extends BaseB {
  constructor(){ super(); this.secret = 5; }
  total(){ return super.value() + this.secret; }
}`;
  const oldJson = await M.compileJsToJson(classes);
  const oldSang = M.compileJsonToSang(oldJson);
  const compact = await M.compileJsToSang(classes);
  const install = await M.executeBinary(compact);
  assert.strictEqual(M.magicOf(compact), 'CCLS');
  assert.strictEqual(install.ok, true);
  assert.ok(install.globals.ChildA, 'ChildA installed');
  assert.ok(install.globals.ChildB, 'ChildB installed');
  const use = await M.executeRawJS(`
    let a = new ChildA();
    let b = new ChildB();
    __awtsmoosResult = a.total() + b.total();
  `, { globals: install.globals });
  assert.strictEqual(use.globals.__awtsmoosResult, 49);

  console.log(JSON.stringify({
    ok: true,
    magic: M.magicOf(compact),
    sourceBytes: Buffer.byteLength(classes),
    oldDescriptorSangBytes: oldSang.length,
    compactClassBinaryBytes: compact.length,
    savedVsOldPercent: Number(((1 - compact.length / oldSang.length) * 100).toFixed(1)),
    savedVsSourcePercent: Number(((1 - compact.length / Buffer.byteLength(classes)) * 100).toFixed(1)),
    result: use.globals.__awtsmoosResult,
    installed: Object.keys(install.globals).filter(k => k.startsWith('Child') || k.startsWith('Base')),
    decoded: {
      poolCount: install.decoded.pool.length,
      classCount: install.decoded.classes.length
    }
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
