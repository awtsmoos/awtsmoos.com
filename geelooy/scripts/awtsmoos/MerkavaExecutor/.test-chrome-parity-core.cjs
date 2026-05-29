// B"H
/**
 * Chapter 2: The mirror-hall of Chrome opens under thunder.
 * Each case runs in Merkava through the public simulateRuntime path, while the
 * expected behavior is encoded from Chrome/ECMAScript observable behavior for
 * the narrow scope/property/TDZ frontier under repair.
 */
(async () => {
  const m = await import('./merkava-service/index.js');
  const cases = [
    ['scope:block-const-hidden', `{ const x = 1; } window.__awtsmoosResult = x;`, { error: 'x is not defined' }],
    ['scope:let-shadow-outer-survives', `let x = 1; { let x = 2; } window.__awtsmoosResult = x === 1;`, { value: true }],
    ['scope:const-shadow-no-leak', `const x = 1; { const x = 2; } window.__awtsmoosResult = x;`, { value: 1 }],
    ['scope:typeof-after-block-let', `{ let x; } window.__awtsmoosResult = typeof x;`, { value: 'undefined' }],
    ['tdz:read-before-let', `window.__awtsmoosResult = a; let a = 1;`, { error: 'a' }],
    ['tdz:block-read-before-let', `{ window.__awtsmoosResult = x; let x = 1; }`, { error: 'x' }],
    ['tdz:typeof-before-let', `window.__awtsmoosResult = typeof tdzVariable; let tdzVariable;`, { error: 'tdzVariable' }],
    ['property:undefined-dot-foo', `window.__awtsmoosResult = undefined.foo;`, { error: 'Cannot read properties' }],
    ['property:null-dot-foo', `window.__awtsmoosResult = null.foo;`, { error: 'Cannot read properties' }],
    ['property:missing-method-chain', `window.__awtsmoosResult = ({}).missing.go();`, { error: 'go' }],
    ['property:optional-missing-call', `window.__awtsmoosResult = ({}).missing?.go();`, { value: undefined }],
    ['property:optional-missing-call-deep', `window.__awtsmoosResult = ({}).missing?.go?.();`, { value: undefined }],
    ['function:object-call-typeerror', `const x = {}; window.__awtsmoosResult = x();`, { error: 'not a function' }],
    ['function:undefined-call-typeerror', `const fn = undefined; window.__awtsmoosResult = fn();`, { error: 'not a function' }],
    ['function:new-undefined-typeerror', `window.__awtsmoosResult = new undefined;`, { error: 'constructor' }]
  ];

  const run = async ([name, source, expect]) => {
    const result = await m.simulateRuntime({
      files: { 'index.html': '<script type="module" src="./index.js"></script>', 'index.js': source },
      entry: 'index.html',
      waitMs: 250,
      returnValues: ['window.__awtsmoosResult']
    });
    const value = result.values?.['window.__awtsmoosResult'];
    const text = JSON.stringify({ errors: result.errors || [], value });
    const passed = Object.prototype.hasOwnProperty.call(expect, 'value')
      ? JSON.stringify(value) === JSON.stringify(expect.value) && !(result.errors || []).length
      : text.includes(expect.error);
    return { name, passed, expect, actual: { ok: result.ok, value, errors: (result.errors || []).map(e => e.message) } };
  };

  const results = [];
  for (const test of cases) results.push(await run(test));
  const failed = results.filter(item => !item.passed);
  console.log(JSON.stringify({ ok: failed.length === 0, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
