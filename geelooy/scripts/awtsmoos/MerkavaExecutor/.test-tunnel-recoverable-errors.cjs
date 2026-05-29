// B"H
const { simulate, requireTruth } = require('./.test-tunnel-simulate-runtime-helpers.cjs');

/**
 * Chapter 5: The broken selector kept its stack like a scar of light.
 * continueOnError must not fake success; it must preserve action logs, errors,
 * and stacks while later actions still run in the Merkava world.
 */
(async () => {
  const actions = [
    { action: 'waitForSelector', selector: '#never', timeoutMs: 25, continueOnError: true },
    { action: 'waitForFunction', source: 'window.ready === true', timeoutMs: 25, continueOnError: true },
    { action: 'click', selector: '#missing', continueOnError: true },
    { action: 'evaluate', source: 'window.afterErrors = "still-running"' },
    { action: 'assertEval', source: 'window.afterErrors', expected: 'still-running' }
  ];
  const result = await simulate({
    html: '<!doctype html><title>Errors</title><main id="ok">alive</main>',
    actions: JSON.stringify(actions),
    returnValues: JSON.stringify(['window.afterErrors', 'document.querySelector("#ok").textContent'])
  });
  const failures = result.interactionLog?.filter(x => x.ok === false) || [];
  const evidence = {
    ok: result.ok,
    values: result.values,
    failures: failures.map(x => ({ action: x.action, error: x.error, hasStack: !!x.stack, stackHead: String(x.stack || '').split('\n')[0] })),
    log: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, continueOnError: x.continueOnError }))
  };
  console.log(JSON.stringify(evidence, null, 2));
  requireTruth(result.ok === true, 'recoverable errors do not fail whole run', evidence);
  requireTruth(failures.length === 3, 'three recoverable failures', evidence);
  requireTruth(failures.every(x => x.continueOnError === true && x.stack), 'every failure has stack', evidence);
  requireTruth(result.values?.['window.afterErrors'] === 'still-running', 'later action executed', evidence);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
