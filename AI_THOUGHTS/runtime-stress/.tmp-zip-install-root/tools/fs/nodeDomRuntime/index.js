// B"H
const { normalizeNodeDomOptions } = require("./options.js");
const { createRuntime } = require("./merkavaAdapter.js");
const { createVmContext, installNamedElements } = require("./vmContext.js");
const { assembleHtml } = require("./htmlPlan.js");
const { hydrate } = require("./htmlHydrate.js");
const { runScripts } = require("./scriptRunner.js");
const { flushRuntime } = require("./timerFlush.js");
const { runBrowserActions } = require("./actions/index.js");
const { installCompat } = require("./compat/installCompat.js");
const { readValues } = require("./values.js");
const { makeResult } = require("./resultAdapter.js");
const { applyFormat } = require("./format/index.js");
const { installAsyncCapture } = require("./asyncCapture.js");

/** Runs browser runtime through Node vm while preserving Merkava's virtual DOM. */
async function simulateNodeDomRuntime(rawOptions = {}) {
  const options = normalizeNodeDomOptions(rawOptions);
  const errors = [];
  const uninstall = installAsyncCapture(errors);
  try {
    const assembled = assembleHtml(options);
    options.entry = assembled.entry;
    options.files = assembled.files;
    const runtime = createRuntime(options).runtime;
    const context = createVmContext(runtime.globals());
    installCompat(context, runtime.window);
    const hydration = hydrate(runtime, assembled.html);
    installNamedElements(context);
    await runScripts({ context, plan: assembled.plan, files: assembled.files, errors, options });
    await flushRuntime(options.waitMs);
    const interactionLog = await runBrowserActions({ window: runtime.window, context, actions: options.browserActions, errors });
    await flushRuntime(0);
    const values = readValues(context, options.returnValues);
    runtime.window.document.readyState = "complete";
    const result = makeResult({ options, runtime, errors, interactionLog, values, hydration });
    return applyFormat(result, options.format);
  } finally {
    uninstall();
  }
}
module.exports = { simulateNodeDomRuntime };
