// B"H
/**
 * @file index.js
 * @description Chapter 12: Thin static Worker shell with bh17 entry cache.
 */
const BH = `B"H`;

function shellPost(type, text) {
  try {
    self.postMessage({ type, text: String(text), message: String(text), details: String(text), errorText: String(text) });
  } catch (error) {
    console.error(`${BH} | OYVED_SHELL | failed to post text | reason=${error?.message || String(error)}`);
  }
}

function shellErrorText(error) {
  if (error instanceof Error) return [`${error.name}: ${error.message}`, `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`].join(" || ");
  return String(error);
}

console.info(`${BH} | OYVED_SHELL | loaded | file=/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/index.js`);
shellPost("worker_text_log", "OYVED_SHELL loaded");

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

import("./core/entry/WorkerEntrypoint.js?v=lean-l1-20260528-bh28")
  .then(module => {
    if (!module || typeof module.startOyvedEntrypoint !== "function") throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");
    console.info(`${BH} | OYVED_SHELL | WorkerEntrypoint module loaded`);
    shellPost("worker_text_log", "OYVED_SHELL imported WorkerEntrypoint.js");
    module.startOyvedEntrypoint();
  })
  .catch(error => {
    const text = ["OYVED_SHELL failed to import WorkerEntrypoint.js", shellErrorText(error), "Meaning: one of the static files under oyved/core/entry or its imports is missing or has a bad export", "Repo-only fix: create the exact missing module or fix the import/export name"].join(" || ");
    console.error(`${BH} | ${text}`);
    self.postMessage({ type: "ERROR", isImportError: true, message: text, details: text, errorText: text });
  });
