// B"H
/**
 * Chapter 103: The chariot must not merely fall; it must name the stone.
 * These stress cases demand Chrome-like syntax/runtime reporting while the
 * source is lowered into Merkava JSON and then SANG bytecode. The bytecode is
 * not an excuse for blindness: every compiled instruction must carry enough
 * source scent to decompile a useful stack.
 */
(async () => {
  const m = await import('./merkava-service/index.js');
  const cases = [
    {
      name: 'syntax-missing-paren',
      files: { 'index.html': '<script type="module" src="./bad.js"></script>', 'bad.js': 'function broken( { return 1; }' },
      expectError: true
    },
    {
      name: 'runtime-nested-function-throw',
      files: { 'index.html': '<script type="module" src="./bad.js"></script>', 'bad.js': 'function alef(){ return beis(); } function beis(){ throw new Error("deep boom"); } alef();' },
      expectError: true
    },
    {
      name: 'runtime-class-method-throw',
      files: { 'index.html': '<script type="module" src="./bad.js"></script>', 'bad.js': 'class A { go(){ throw new TypeError("method boom"); } } new A().go();' },
      expectError: true
    },
    {
      name: 'return-values-optional-bang',
      files: { 'index.html': '<script type="module" src="./ok.js"></script>', 'ok.js': 'window.obj={ a:{ b(){ return 7; } } };' },
      returnValues: ['!!window.obj', 'window.obj?.a?.b?.()', 'window.obj?.missing?.() || "fallback"'],
      expectError: false
    }
  ];
  const results = [];
  for (const test of cases) {
    const r = await m.simulateRuntime({ files: test.files, entry: 'index.html', waitMs: 500, returnValues: test.returnValues || [] });
    results.push({
      name: test.name,
      ok: r.ok,
      errorCount: (r.errors || []).length,
      errors: (r.errors || []).map(e => ({ message: e.message, stack: e.stack, code: e.code, trace: e.trace })).slice(0, 3),
      values: r.values,
      expected: test.expectError ? 'error' : 'ok'
    });
  }
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
