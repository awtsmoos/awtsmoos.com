// B"H
/**
 * Stress: scope correctness, undefined identifiers, syntax/runtime detection.
 * A real JS runtime must distinguish syntax, ReferenceError, TypeError, and
 * lexical visibility. This does not trust ok=true; it records expected result.
 */
(async () => {
  const m = await import('./merkava-service/index.js');
  const cases = [
    {
      name: 'undefined-global-read-throws-referenceerror',
      source: `window.__awtsmoosResult = missingName + 1;`,
      expectErrorIncludes: 'missingName'
    },
    {
      name: 'nested-scope-visible-parent',
      source: `const x = 5; function f(){ return x + 2; } window.__awtsmoosResult = f();`,
      expectValue: 7
    },
    {
      name: 'function-local-not-global',
      source: `function f(){ const secret = 9; return secret; } f(); window.__awtsmoosResult = secret;`,
      expectErrorIncludes: 'secret'
    },
    {
      name: 'block-local-not-outer',
      source: `{ const y = 3; } window.__awtsmoosResult = y;`,
      expectErrorIncludes: 'y'
    },
    {
      name: 'type-error-method-of-undefined',
      source: `const obj = {}; window.__awtsmoosResult = obj.missing.go();`,
      expectErrorIncludes: 'go'
    },
    {
      name: 'syntax-unclosed-array',
      source: `window.__awtsmoosResult = [1, 2, 3;`,
      expectErrorIncludes: 'expected'
    },
    {
      name: 'runtime-stack-nested-call',
      source: `function a(){ return b(); } function b(){ return c(); } function c(){ throw new Error('stack flame'); } a();`,
      expectErrorIncludes: 'stack flame'
    }
  ];
  const results = [];
  for (const test of cases) {
    const r = await m.simulateRuntime({
      files: { 'index.html': '<script type="module" src="./index.js"></script>', 'index.js': test.source },
      entry: 'index.html',
      waitMs: 250,
      returnValues: ['window.__awtsmoosResult']
    });
    const errors = (r.errors || []).map(e => ({ message: e.message, code: e.code, line: e.line, column: e.column, frame: e.frame, trace: e.trace, stack: e.stack }));
    const value = r.values?.['window.__awtsmoosResult'];
    const actualText = JSON.stringify({ errors, value });
    const passed = Object.prototype.hasOwnProperty.call(test, 'expectValue')
      ? JSON.stringify(value) === JSON.stringify(test.expectValue) && errors.length === 0
      : actualText.includes(test.expectErrorIncludes);
    results.push({ name: test.name, passed, ok: r.ok, value, errors });
  }
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
