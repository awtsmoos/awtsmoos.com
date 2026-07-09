// B"H
/**
 * @file SafeModuleImport.js
 * @description Timed, named, case-safe dynamic imports for worker boot modules.
 */
import { workerImportLog, postTextToMain } from "../log/WorkerTextLogger.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { resolveModuleRecord } from "./ModuleUrlResolver.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { makeModuleFailureText, makeModuleStartText, makeModuleSuccessText } from "./ModuleLoadText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { requireModuleExport } from "./ModuleExportValidator.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";

export const IMPORT_TIMEOUT_MS = 120000;

function timeoutImport(resolved) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(`Timed out importing ${resolved.label} after ${IMPORT_TIMEOUT_MS}ms at ${resolved.url}`);
      error.name = "AwtsmoosImportTimeout";
      reject(error);
    }, IMPORT_TIMEOUT_MS);
  });
}

async function importResolvedUrl(resolved) {
  workerImportLog.info?.(makeModuleStartText(resolved));
  postWorkerProgress(`module:${resolved.key || resolved.label}:import:start`, { url: resolved.url });
  const module = await Promise.race([import(resolved.url), timeoutImport(resolved)]);
  postWorkerProgress(`module:${resolved.key || resolved.label}:import:done`, { url: resolved.url });
  return module;
}

/**
 * B"H
 * Imports one ledger module and verifies its required export.
 *
 * @param {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport?:string}} record Module ledger row.
 * @returns {Promise<{record:object,module:object,required:*}>} Import result.
 */
export async function importLedgerModule(record) {
  const resolved = resolveModuleRecord(record);

  try {
    const module = await importResolvedUrl(resolved);
    postWorkerProgress(`module:${resolved.key || resolved.label}:export-check:start`);
    const required = requireModuleExport(module, resolved);
    postWorkerProgress(`module:${resolved.key || resolved.label}:export-check:done`);
    workerImportLog.info?.(makeModuleSuccessText(resolved));
    return { record: resolved, module, required };
  } catch (error) {
    const text = makeModuleFailureText({
      label: resolved.label,
      url: resolved.url,
      relativePath: resolved.relativePath,
      expectedEnd: resolved.expectedEnd,
      requiredExport: resolved.requiredExport,
      error
    });
    workerImportLog.error(text);
    postTextToMain("worker_import_error_text", text);
    throw error;
  }
}
