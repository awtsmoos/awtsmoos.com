
/**
 * B"H
 * @file ErrorHandler.js
 * @description
 * Text-only worker boot error handler.
 */

import { workerErrorLog, postTextToMain } from "../log/WorkerTextLogger.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { makeWorkerFailureMessage } from "../errors/WorkerFailureMessage.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Handles worker boot errors without object console logs.
 */
export class ErrorHandler {
  /**
   * B"H
   * Handles fatal boot failure.
   *
   * @param {unknown} error
   * Error value.
   *
   * @returns {{isReady:false,errorText:string,isImportError:boolean}}
   * Failure state.
   */
  static handle(error) {
    const failure = makeWorkerFailureMessage(error);

    workerErrorLog.error(failure.text);
    postTextToMain("ERROR_TEXT", failure.text);

    try {
      self.postMessage({
        type: "ERROR",
        isImportError: failure.isImportError,
        message: failure.text,
        details: failure.text,
        errorText: failure.text
      });
    } catch (postError) {
      workerErrorLog.error("Could not post ERROR message to main thread", {
        reason: postError?.message || String(postError)
      });
    }

    return {
      isReady: false,
      errorText: failure.text,
      isImportError: failure.isImportError
    };
  }
}
