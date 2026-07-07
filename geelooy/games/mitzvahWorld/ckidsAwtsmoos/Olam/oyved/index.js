// B"H
/**
 * @file index.js
 * @description Worker shell that imports the current case-safe entrypoint.
 */
const BH = `B"H`;
const ENTRY_SEAL = "case-correct-olam-import-20260706-bh3";

function shellPost(type, text) {
  try {
    self.postMessage({
      type,
      text: String(text),
      message: String(text),
      details: String(text),
      errorText: String(text)
    });
  } catch (error) {
    console.error(`${BH} | OYVED_SHELL | failed to post text | reason=${error?.message || String(error)}`);
  }
}

function shellErrorText(error) {
  if (error instanceof Error) {
    return [
      `${error.name}: ${error.message}`,
      `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`
    ].join(" || ");
  }
  return String(error);
}

shellPost("worker_text_log", `OYVED_SHELL loaded || seal=${ENTRY_SEAL}`);

self.addEventListener("error", event => {
  const text = [
    "OYVED_SHELL runtime error",
    `message=${event.message || "unknown"}`,
    `filename=${event.filename || "unknown"}`,
    `line=${event.lineno || 0}`,
    `column=${event.colno || 0}`
  ].join(" || ");
  console.error(`${BH} | ${text}`);
  shellPost("ERROR_TEXT", text);
});

self.addEventListener("unhandledrejection", event => {
  const text = ["OYVED_SHELL unhandled rejection", shellErrorText(event.reason)].join(" || ");
  console.error(`${BH} | ${text}`);
  shellPost("ERROR_TEXT", text);
});

import(`./core/entry/WorkerEntrypoint.js?v=${ENTRY_SEAL}`)
  .then(module => {
    if (!module || typeof module.startOyvedEntrypoint !== "function") {
      throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");
    }
    shellPost("worker_text_log", `OYVED_SHELL imported WorkerEntrypoint.js || seal=${ENTRY_SEAL}`);
    module.startOyvedEntrypoint();
  })
  .catch(error => {
    const text = [
      "OYVED_SHELL failed to import WorkerEntrypoint.js",
      shellErrorText(error),
      "friendlyRepair=Retry after clearing the cached worker; keep ckidsAwtsmoos/Olam uppercase.",
      "repoOnlyFix=create exact missing module or fix import/export"
    ].join(" || ");
    console.error(`${BH} | ${text}`);
    self.postMessage({ type: "ERROR", isImportError: true, message: text, details: text, errorText: text });
  });
