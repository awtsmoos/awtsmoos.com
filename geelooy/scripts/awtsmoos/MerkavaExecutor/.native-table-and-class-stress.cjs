// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const requiredCss = [
    'margin','marginLeft','padding','paddingRight','display','gridTemplateColumns','color','backgroundColor','borderRadius','transform','transition','animation','opacity','zIndex','position','top','left','width','height','flex','grid','containerType','fontSize','fontWeight','lineHeight','overflow','boxShadow','textAlign','userSelect','pointerEvents'
  ];
  const requiredSelectors = ['#','.',':hover',':focus',':checked',':not','::before','::after','>','+','~'];
  const requiredDomNode = ['document','window','getElementById','querySelector','addEventListener','dispatchEvent','textContent','classList','dataset','postMessage','Worker','readFileSync','writeFileSync','Uint8Array','Promise','Map','Set'];
  for (const name of [...requiredCss, ...requiredSelectors, ...requiredDomNode]) {
    assert.ok(Object.prototype.hasOwnProperty.call(MerkavaExecutor.NATIVE_INDEX, name), `native missing: ${name}`);
  }
  assert.ok(MerkavaExecutor.CSS_PROPERTIES.length >= 250, `expected broad CSS property table, got ${MerkavaExecutor.CSS_PROPERTIES.length}`);

  const classRun = await MerkavaExecutor.executeRawJS(`
    class Base { value(){ return 10; } }
    class Child extends Base { value(){ return super.value() + 32; } }
    let c = new Child();
    __awtsmoosResult = c.value();
  `);
  assert.strictEqual(classRun.globals.__awtsmoosResult, 42);

  const methodRun = await MerkavaExecutor.executeRawJS(`
    class Box { set(v){ this.value = v; } get(){ return this.value; } }
    let box = new Box();
    box.set(42);
    __awtsmoosResult = box.get();
  `);
  assert.strictEqual(methodRun.globals.__awtsmoosResult, 42);

  console.log(JSON.stringify({
    ok: true,
    nativeCounts: {
      cssProperties: MerkavaExecutor.CSS_PROPERTIES.length,
      cssSelectors: MerkavaExecutor.CSS_SELECTORS.length,
      htmlTags: MerkavaExecutor.HTML_TAGS.length,
      domNames: MerkavaExecutor.DOM_PROPS_METHODS.length,
      nodeNames: MerkavaExecutor.NODE_METHODS.length,
      jsNative: MerkavaExecutor.JS_NATIVE.length,
      totalNativeWords: MerkavaExecutor.ALL_NATIVE_WORDS.length
    },
    classInheritance: classRun.globals.__awtsmoosResult,
    customMethodState: methodRun.globals.__awtsmoosResult
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
