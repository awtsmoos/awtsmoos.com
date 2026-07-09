// B"H
/** Worker shell: imports the entrypoint by real path, not by cache ritual. */
import { startOyvedEntrypoint } from "./core/entry/WorkerEntrypoint.js";
const BH = 'B"H';
const ENTRY_SEAL = "stable-direct-worker-boot-20260709-bh2";
function textOf(value) { return String(value); }
function errorMessage(error) { return error?.message ? error.message : String(error); }
function shellPost(type, text) {
  try { self.postMessage({ type, text:textOf(text), message:textOf(text), details:textOf(text), errorText:textOf(text) }); }
  catch (error) { console.error(`${BH} | OYVED_SHELL post failed | ${errorMessage(error)}`); }
}
function shellErrorText(error) {
  if (error instanceof Error) return [`${error.name}: ${error.message}`, `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`].join(" || ");
  return String(error);
}
shellPost("worker_text_log", `OYVED_SHELL loaded || seal=${ENTRY_SEAL}`);
self.addEventListener("error", event => shellPost("ERROR_TEXT", ["OYVED_SHELL runtime error", `message=${event.message || "unknown"}`, `filename=${event.filename || "unknown"}`, `line=${event.lineno || 0}`, `column=${event.colno || 0}`].join(" || ")));
self.addEventListener("unhandledrejection", event => shellPost("ERROR_TEXT", ["OYVED_SHELL unhandled rejection", shellErrorText(event.reason)].join(" || ")));
try {
  if (typeof startOyvedEntrypoint !== "function") throw new Error("WorkerEntrypoint.js missing startOyvedEntrypoint export");
  shellPost("worker_text_log", `OYVED_SHELL imported WorkerEntrypoint.js || seal=${ENTRY_SEAL}`);
  startOyvedEntrypoint();
} catch (error) {
  const text = ["OYVED_SHELL failed to start WorkerEntrypoint.js", shellErrorText(error), "repoOnlyFix=create exact missing module or export"].join(" || ");
  console.error(`${BH} | ${text}`);
  self.postMessage({ type:"ERROR", isImportError:true, message:text, details:text, errorText:text });
}
