// B"H
/**
 * @file index.js
 * @description Worker shell with cache-busted worker entrypoint import.
 */
import { startOyvedEntrypoint } from "./core/entry/WorkerEntrypoint.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";

const BH = 'B"H';
const ENTRY_SEAL = "worker-module-olam-index-fix-20260708-bh6";

function textOf(value) {
  return String(value);
}

function errorMessage(error) {
  if (error && error.message) return error.message;
  return String(error);
}

function shellPost(type, text) {
  try {
    self.postMessage({
      type: type,
      text: textOf(text),
      message: textOf(text),
      details: textOf(text),
      errorText: textOf(text)
    });
  } catch (error) {
    console.error(BH + " | OYVED_SHELL | failed to post text | reason=" + errorMessage(error));
  }
}

function shellErrorText(error) {
  if (error instanceof Error) {
    return [
      error.name + ": " + error.message,
      "stack=" + String(error.stack || "no stack").replace(/\s+/g, " ")
    ].join(" || ");
  }
  return String(error);
}

shellPost("worker_text_log", "OYVED_SHELL loaded || seal=" + ENTRY_SEAL);

self.addEventListener("error", function (event) {
  const text = [
    "OYVED_SHELL runtime error",
    "message=" + (event.message || "unknown"),
    "filename=" + (event.filename || "unknown"),
    "line=" + (event.lineno || 0),
    "column=" + (event.colno || 0)
  ].join(" || ");
  console.error(BH + " | " + text);
  shellPost("ERROR_TEXT", text);
});

self.addEventListener("unhandledrejection", function (event) {
  const text = ["OYVED_SHELL unhandled rejection", shellErrorText(event.reason)].join(" || ");
  console.error(BH + " | " + text);
  shellPost("ERROR_TEXT", text);
});

try {
  if (typeof startOyvedEntrypoint !== "function") {
    throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");
  }
  shellPost("worker_text_log", "OYVED_SHELL imported WorkerEntrypoint.js || seal=" + ENTRY_SEAL);
  startOyvedEntrypoint();
} catch (error) {
  const text = [
    "OYVED_SHELL failed to start WorkerEntrypoint.js",
    shellErrorText(error),
    "friendlyRepair=Retry after clearing cached worker; keep ckidsAwtsmoos/Olam uppercase.",
    "repoOnlyFix=create exact missing module or fix import/export"
  ].join(" || ");
  console.error(BH + " | " + text);
  self.postMessage({ type:"ERROR", isImportError:true, message:text, details:text, errorText:text });
}
