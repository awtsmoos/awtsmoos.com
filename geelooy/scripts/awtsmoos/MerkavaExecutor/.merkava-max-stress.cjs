// B"H
const assert = require('assert');
const {
  runJsCode,
  runJsAsSang,
  compileJsToJson,
  encodeWebBinary,
  runWebBinary,
  triggerWebEvent
} = require('./merkava-binary');

const jsCases = [
  {
    name: 'vars arithmetic assignment',
    source: `let total = seed + 12; let product = total * 3; __awtsmoosResult = product - 6;`,
    globals: { seed: 5 },
    expect: 45,
    shouldPass: true
  },
  {
    name: 'class extends method call',
    source: `class A { value(){ return 7; } } class B extends A { value(){ return super.value() + 5; } } __awtsmoosResult = new B().value();`,
    expect: 12,
    shouldPass: true
  },
  {
    name: 'generator yield',
    source: `function* g(){ yield 1; yield 2; } const it = g(); __awtsmoosResult = it.next().value + it.next().value;`,
    expect: 3,
    shouldPass: true
  },
  {
    name: 'async await',
    source: `async function f(){ return await 9; } __awtsmoosResult = await f();`,
    expect: 9,
    shouldPass: true
  }
];

(async () => {
  const jsResults = [];
  for (const item of jsCases) {
    try {
      const json = await compileJsToJson(item.source);
      const direct = await runJsCode(item.source, { globals: item.globals || {} });
      const packed = await runJsAsSang(item.source, { globals: item.globals || {} });
      const value = direct.globals.__awtsmoosResult ?? direct.result;
      jsResults.push({ name: item.name, ok: direct.ok && packed.ok, value, json });
      if (item.shouldPass) assert.strictEqual(value, item.expect);
    } catch (error) {
      jsResults.push({ name: item.name, ok: false, error: error.message });
      if (item.shouldPass) throw error;
    }
  }

  const advancedWeb = {
    nodes: [
      { tag: 'main', id: 'app', text: '' },
      { tag: 'section', id: 'panel', parent: 'app', text: 'Ready' },
      { tag: 'button', id: 'send', parent: 'app', text: 'Send' },
      { tag: 'output', id: 'chat', parent: 'app', text: '' }
    ],
    styles: [
      { target: 'app', props: { display: 'grid', gap: '12px', padding: '1rem' } },
      { target: 'panel', props: { background: 'linear-gradient(90deg, red, blue)', borderRadius: '16px', transform: 'translateZ(0)' } },
      { target: 'chat', props: { color: 'gold', fontWeight: '700', containerType: 'inline-size' } }
    ],
    events: [
      { target: 'send', on: 'click', do: [{ op: 'setText', target: 'chat', value: 'Advanced BH' }, { op: 'emit', name: 'sent', value: 'Advanced BH' }] }
    ]
  };
  const bin = encodeWebBinary(advancedWeb);
  const web = runWebBinary(bin);
  assert.strictEqual(web.document.getElementById('panel').style.background, 'linear-gradient(90deg, red, blue)');
  assert.strictEqual(triggerWebEvent(web, 'send', 'click'), true);
  assert.strictEqual(web.document.getElementById('chat').textContent, 'Advanced BH');
  assert.deepStrictEqual(web.events, [{ name: 'sent', value: 'Advanced BH' }]);

  console.log(JSON.stringify({
    ok: true,
    jsResults,
    advancedWeb: {
      binaryBytes: bin.length,
      nodes: web.document.body.children.length,
      chat: web.document.getElementById('chat').textContent,
      events: web.events
    }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
