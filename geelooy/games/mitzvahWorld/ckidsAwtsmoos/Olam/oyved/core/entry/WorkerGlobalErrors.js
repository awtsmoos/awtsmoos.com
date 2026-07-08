
/**
 * B"H
 * @file WorkerGlobalErrors.js
 * @description
 * Global Worker error wiring with text-only reports.
 */

import { postPlainWorkerText, postPlainWorkerError } from "./PlainWorkerPost.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Installs global worker error listeners.
 *
 * @returns {void}
 */
export function installWorkerGlobalErrors() {
  self.addEventListener("error", event => {
    const text = [
      "Worker global error",
      `message=${event.message || "unknown"}`,
      `filename=${event.filename || "unknown"}`,
      `line=${event.lineno || 0}`,
      `column=${event.colno || 0}`
    ].join(" || ");

    console.error(`B"H | ${text}`);
    postPlainWorkerError(text, text.includes(".js"));
  });

  self.addEventListener("unhandledrejection", event => {
    const text = [
      "Worker unhandled rejection",
      plainWorkerErrorText(event.reason)
    ].join(" || ");

    console.error(`B"H | ${text}`);
    postPlainWorkerError(text, isPlainImportError(event.reason));
  });

  postPlainWorkerText("worker_text_log", "Worker global error listeners installed");
}
