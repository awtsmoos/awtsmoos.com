// B"H
/**
 * Custom-code syntax probes before returning to Mitzvah World.
 * Each case is tiny and reports exact Merkava output.
 */
(async () => {
  const m = await import('./merkava-service/index.js');
  const cases = [
    {
      name: 'array-object-method-call',
      source: `window.__awtsmoosResult = [{ a: 1, b: [2, 3] }].map(x => x.b[1]);`
    },
    {
      name: 'template-with-expression',
      source: 'const a = 7; window.__awtsmoosResult = `value-${a + 1}`;'
    },
    {
      name: 'nested-array-calls',
      source: `const out = [1, 2, 3].map(x => ({ value: x, label: 'x' + x })); window.__awtsmoosResult = out[2].label;`
    },
    {
      name: 'array-with-function-args',
      source: `function f(a, b){ return [a, b].join(':'); } window.__awtsmoosResult = ['a', f('b', 'c')];`
    },
    {
      name: 'optional-chain-in-array',
      source: `const o = { a: { b(){ return 11; } } }; window.__awtsmoosResult = [!!o, o?.a?.b?.(), o?.x?.() || 'fallback'];`
    }
  ];
  const results = [];
  for (const test of cases) {
    const r = await m.simulateRuntime({
      files: { 'index.html': '<script type="module" src="./index.js"></script>', 'index.js': test.source },
      entry: 'index.html',
      waitMs: 200,
      returnValues: ['window.__awtsmoosResult']
    });
    results.push({ name: test.name, ok: r.ok, errors: (r.errors || []).map(e => e.message), value: r.values?.['window.__awtsmoosResult'] });
  }
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
