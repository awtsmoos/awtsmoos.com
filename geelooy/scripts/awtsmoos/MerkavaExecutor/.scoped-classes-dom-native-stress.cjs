// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const classSourceA = `class User { constructor(){ this.value = 10; } get(){ return this.value; } }`;
  const classSourceB = `class User { constructor(){ this.value = 32; } get(){ return this.value; } }`;
  const globals = {};
  const binA = await M.compileToBinary(classSourceA, { type: 'js', scopeName: 'moduleA', exposeGlobals: false });
  const binB = await M.compileToBinary(classSourceB, { type: 'js', scopeName: 'moduleB', exposeGlobals: false });
  const runA = await M.executeBinary(binA, { globals, exposeGlobals: false });
  const runB = await M.executeBinary(binB, { globals, exposeGlobals: false });
  assert.strictEqual(runA.ok, true);
  assert.strictEqual(runB.ok, true);
  assert.strictEqual(globals.__merkavaScopes.moduleA.classes[0].name, 'User');
  assert.strictEqual(globals.__merkavaScopes.moduleB.classes[0].name, 'User');
  assert.notStrictEqual(globals.__merkavaScopes.moduleA.classes[0], globals.__merkavaScopes.moduleB.classes[0]);
  const aInst = M.newCompactInstance(globals.__merkavaScopes.moduleA.classes[0], [], globals);
  const bInst = M.newCompactInstance(globals.__merkavaScopes.moduleB.classes[0], [], globals);
  assert.strictEqual(M.callCompactMethod(aInst, 'get', [], globals), 10);
  assert.strictEqual(M.callCompactMethod(bInst, 'get', [], globals), 32);

  const document = M.createDocumentStub();
  const domRun = await M.executeRawJS(`
    let el = document.createElement('div');
    el.setAttribute('id', 'made');
    el.setAttribute('data-role', 'native');
    el.textContent = 'BH DOM';
    document.body.appendChild(el);
    __awtsmoosResult = document.getElementById('made').textContent;
  `, { globals: { document } });
  assert.strictEqual(domRun.globals.__awtsmoosResult, 'BH DOM');
  assert.strictEqual(document.getElementById('made').dataset.role, 'native');
  assert.strictEqual(document.body.children[0].textContent, 'BH DOM');

  console.log(JSON.stringify({
    ok: true,
    scopedClasses: {
      binABytes: binA.length,
      binBBytes: binB.length,
      scopeNames: Object.keys(globals.__merkavaScopes),
      moduleAValue: M.callCompactMethod(aInst, 'get', [], globals),
      moduleBValue: M.callCompactMethod(bInst, 'get', [], globals)
    },
    domNative: {
      result: domRun.globals.__awtsmoosResult,
      bodyChildren: document.body.children.length,
      made: { id: document.getElementById('made').id, textContent: document.getElementById('made').textContent, dataset: document.getElementById('made').dataset, tagName: document.getElementById('made').tagName }
    }
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
