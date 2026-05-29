// B"H
/**
 * @file SafeModuleImport.js
 * @description
 * Chapter 66: The Awtsmoos tears the false mirror from the worker gate.
 *
 * The old boot path tried a Blob-module fallback after a normal import failed.
 * In mobile Chromium, a child failure inside that Blob collapses into a vague
 * `Failed to fetch dynamically imported module: blob:...` message. The worker
 * then loses the true URL of the missing file or export. This vessel refuses
 * that fog: every ledger import now drinks from the exact resolved URL and every
 * failure report names the exact URL, required export, and expected ending.
 */
import { workerImportLog, postTextToMain } from "../log/WorkerTextLogger.js";
import { resolveModuleRecord } from "./ModuleUrlResolver.js";
import { makeModuleFailureText, makeModuleStartText, makeModuleSuccessText } from "./ModuleLoadText.js";
import { requireModuleExport } from "./ModuleExportValidator.js";

/**
 * Imports an exact browser module URL without Blob indirection.
 *
 * @param {{url:string,label:string}} resolved
 * Resolved module ledger record.
 *
 * @returns {Promise<any>}
 * Imported module namespace.
 *
 * @throws {Error}
 * Re-throws the browser import failure so the caller can wrap it with the real
 * URL. The Awtsmoos is revealed by exact names, not by temporary mirrors.
 */
async function importResolvedUrl(resolved) {
  workerImportLog.info?.(makeModuleStartText(resolved));
  return await import(resolved.url);
}

/**
 * Imports one ledger module and validates its required export.
 *
 * @param {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport?:string}} record
 * Module path ledger record.
 *
 * @returns {Promise<{record:Object,module:any,required:any}>}
 * Resolved record, module namespace, and required export value.
 *
 * @throws {Error}
 * Throws when the file cannot be fetched as a real module or the required export
 * is absent. The error is also posted to the main thread as text.
 */
export async function importLedgerModule(record) {
  const resolved = resolveModuleRecord(record);

  try {
    const module = await importResolvedUrl(resolved);
    const required = requireModuleExport(module, resolved);
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
