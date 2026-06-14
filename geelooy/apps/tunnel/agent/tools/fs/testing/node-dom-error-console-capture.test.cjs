// B"H
const assert = require("assert");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));

/**
 * B"H
 * Chapter 420: Even The Broken Page Testified.
 *
 * node-dom must not merely glow when pages are pure. It must carry the cries of
 * broken pages: console.log, console.warn, console.error, sync throw, rejected
 * promise, and failed browser action, each recorded in the vessel.
 */
function textOf(value) {
  return JSON.stringify(value || "");
}

async function runCases() {
  return {
    consoleOnly: await simulateNodeDomRuntime({
      html: `<body><div id="out"></div><script>
        console.log('LOG_ONE', 7);
        console.warn('WARN_ONE');
        console.error('ERROR_ONE', {a: 1});
        out.textContent = 'done';
      </script></body>`,
      returnValues: ["out.textContent"],
      waitMs: 20
    }),
    syncThrow: await simulateNodeDomRuntime({
      html: `<body><script>
        console.log('BEFORE_THROW');
        throw new Error('BH_OBVIOUS_SYNC_THROW');
      </script></body>`,
      waitMs: 20
    }),
    rejectedPromise: await simulateNodeDomRuntime({
      html: `<body><script>
        console.log('BEFORE_REJECT');
        Promise.reject(new Error('BH_OBVIOUS_REJECTION'));
      </script></body>`,
      waitMs: 50
    }),
    actionFailure: await simulateNodeDomRuntime({
      html: `<body><div id="out">actual text</div><script>console.log('BEFORE_ASSERT_ACTION')</script></body>`,
      browserActions: [{ action: "assertText", selector: "#out", expected: "missing text" }],
      waitMs: 20
    })
  };
}

function compact(cases) {
  return Object.fromEntries(Object.entries(cases).map(([name, result]) => [name, {
    ok: result.ok,
    score: result.score,
    errors: (result.errors || []).map(e => ({ message: e.message, phase: e.phase, file: e.file })).slice(0, 8),
    console: result.console,
    values: result.values,
    interactionLog: result.interactionLog
  }]));
}

function assertCases(cases) {
  assert.equal(cases.consoleOnly.ok, true);
  assert.ok(textOf(cases.consoleOnly.console).includes("LOG_ONE"));
  assert.ok(textOf(cases.consoleOnly.console).includes("WARN_ONE"));
  assert.ok(textOf(cases.consoleOnly.console).includes("ERROR_ONE"));
  assert.equal(cases.consoleOnly.values["out.textContent"], "done");

  assert.equal(cases.syncThrow.ok, false);
  assert.ok(textOf(cases.syncThrow.errors).includes("BH_OBVIOUS_SYNC_THROW"));
  assert.ok(textOf(cases.syncThrow.console).includes("BEFORE_THROW"));

  assert.equal(cases.rejectedPromise.ok, false);
  assert.ok(textOf(cases.rejectedPromise.errors).includes("BH_OBVIOUS_REJECTION"));
  assert.ok(textOf(cases.rejectedPromise.console).includes("BEFORE_REJECT"));

  assert.equal(cases.actionFailure.ok, false);
  assert.ok(textOf(cases.actionFailure.errors).includes("Text mismatch"));
  assert.ok(textOf(cases.actionFailure.interactionLog).includes("Text mismatch"));
  assert.ok(textOf(cases.actionFailure.console).includes("BEFORE_ASSERT_ACTION"));
}

(async () => {
  const cases = await runCases();
  assertCases(cases);
  console.log(JSON.stringify({ ok: true, cases: compact(cases) }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
