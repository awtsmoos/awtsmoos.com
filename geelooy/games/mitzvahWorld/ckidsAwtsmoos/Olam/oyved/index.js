// B"H
/**
 * @file index.js
 * @description Chapter 75: thin worker shell with the wide-platform boot key.
 * The Awtsmoos begins the worker with a single current name so no bh65 shell
 * can secretly summon the old tiny moving platform interpreter.
 */
const BH = `B"H`;
const ENTRY_VERSION = "wide-platform-real-boot-chain-20260529-bh75";

function shellPost(type, text) {
  try { self.postMessage({ type, text: String(text), message: String(text), details: String(text), errorText: String(text) }); }
  catch (error) { console.error(`${BH} | OYVED_SHELL | failed to post text | reason=${error?.message || String(error)}`); }
}

function shellErrorText(error) {
  if (error instanceof Error) return [`${error.name}: ${error.message}`, `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`].join(" || ");
  return String(error);
}

shellPost("worker_text_log", `OYVED_SHELL loaded ${ENTRY_VERSION}`);
self.addEventListener("error", event => {
  const text = ["OYVED_SHELL runtime error", `message=${event.message || "unknown"}`, `filename=${event.filename || "unknown"}`, `line=${event.lineno || 0}`, `column=${event.colno || 0}`].join(" || ");
  console.error(`${BH} | ${text}`);
  shellPost("ERROR_TEXT", text);
});
self.addEventListener("unhandledrejection", event => {
  const text = ["OYVED_SHELL unhandled rejection", shellErrorText(event.reason)].join(" || ");
  console.error(`${BH} | ${text}`);
  shellPost("ERROR_TEXT", text);
});

import(`./core/entry/WorkerEntrypoint.js?v=${ENTRY_VERSION}`)
  .then(module => {
    if (!module || typeof module.startOyvedEntrypoint !== "function") throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");
    shellPost("worker_text_log", `OYVED_SHELL imported WorkerEntrypoint.js ${ENTRY_VERSION}`);
    module.startOyvedEntrypoint();
  })
  .catch(error => {
    const text = ["OYVED_SHELL failed to import WorkerEntrypoint.js", shellErrorText(error), "Repo-only fix: create exact missing module or fix import/export"].join(" || ");
    console.error(`${BH} | ${text}`);
    self.postMessage({ type: "ERROR", isImportError: true, message: text, details: text, errorText: text });
  });
