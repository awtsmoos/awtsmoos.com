
/**
 * B"H
 * @file index.js
 * @description
 * The thinnest possible static Worker shell.
 *
 * This file intentionally has ZERO static imports.
 *
 * Why?
 * Because static Worker import failure gives the main thread only:
 * "Worker script error | message=unknown | filename=unknown"
 *
 * By using one guarded dynamic import, the shell itself loads first,
 * then reports the real failing child module as plain text.
 */

const BH = `B"H`;

/**
 * B"H
 * Sends plain text from the Worker shell to the main thread.
 *
 * @param {string} type
 * Message type.
 *
 * @param {string} text
 * Plain text.
 *
 * @returns {void}
 */
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

/**
 * B"H
 * Converts thrown values into one line.
 *
 * @param {unknown} error
 * Error.
 *
 * @returns {string}
 * One-line text.
 */
function shellErrorText(error) {
  if (error instanceof Error) {
    return [
      `${error.name}: ${error.message}`,
      `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`
    ].join(" || ");
  }

  return String(error);
}

console.info(`${BH} | OYVED_SHELL | loaded | file=/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/index.js`);
shellPost("worker_text_log", "OYVED_SHELL loaded");

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
  const text = [
    "OYVED_SHELL unhandled rejection",
    shellErrorText(event.reason)
  ].join(" || ");

  console.error(`${BH} | ${text}`);
  shellPost("ERROR_TEXT", text);
});

import("./core/entry/WorkerEntrypoint.js")
  .then(module => {
    if (!module || typeof module.startOyvedEntrypoint !== "function") {
      throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");
    }

    console.info(`${BH} | OYVED_SHELL | WorkerEntrypoint module loaded`);
    shellPost("worker_text_log", "OYVED_SHELL imported WorkerEntrypoint.js");

    module.startOyvedEntrypoint();
  })
  .catch(error => {
    const text = [
      "OYVED_SHELL failed to import WorkerEntrypoint.js",
      shellErrorText(error),
      "Meaning: one of the static files under oyved/core/entry or its imports is missing or has a bad export",
      "Repo-only fix: create the exact missing module or fix the import/export name"
    ].join(" || ");

    console.error(`${BH} | ${text}`);

    self.postMessage({
      type: "ERROR",
      isImportError: true,
      message: text,
      details: text,
      errorText: text
    });
  });
