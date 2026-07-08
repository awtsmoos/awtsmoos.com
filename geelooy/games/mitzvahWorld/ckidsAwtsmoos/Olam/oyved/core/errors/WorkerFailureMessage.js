
/**
 * B"H
 * @file WorkerFailureMessage.js
 * @description
 * Builds text-only Worker failure messages.
 */

import { errorToText, isImportFailure } from "./ErrorTextSerializer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Creates text for fatal Worker boot errors.
 *
 * @param {unknown} error
 * Error value.
 *
 * @returns {{isImportError:boolean,text:string}}
 * Failure report.
 */
export function makeWorkerFailureMessage(error) {
  const importError = isImportFailure(error);
  const base = errorToText(error);

  if (importError) {
    return {
      isImportError: true,
      text: [
        "Worker module import failed",
        base,
        "Meaning=a static module URL failed or a required export was missing",
        "RepoOnlyFix=add the exact missing file or export the exact value requested",
        "ServerSideFilesEver=false",
        "PermanentFixApplied=Worker imports Olam core directly from ckidsAwtsmoos/Olam/core/OlamVessel.js instead of fragile ckidsAwtsmoos/Olam/index.js"
      ].join(" || ")
    };
  }

  return {
    isImportError: false,
    text: [
      "Worker fatal error",
      base,
      "ServerSideFilesEver=false"
    ].join(" || ")
  };
}
