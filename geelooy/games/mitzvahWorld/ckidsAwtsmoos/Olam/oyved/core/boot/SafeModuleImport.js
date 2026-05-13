
/**
 * B"H
 * @file SafeModuleImport.js
 * @description
 * Dynamic import wrapper with exact text logs and export validation.
 */

import { workerImportLog, postTextToMain } from "../log/WorkerTextLogger.js";
import { resolveModuleRecord } from "./ModuleUrlResolver.js";
import {
  makeModuleStartText,
  makeModuleSuccessText,
  makeModuleFailureText
} from "./ModuleLoadText.js";
import { requireModuleExport } from "./ModuleExportValidator.js";

/**
 * B"H
 * Imports one ledger module and validates its required export.
 *
 * @param {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport?:string}} record
 * Module path ledger record.
 *
 * @returns {Promise<{record:Object,module:any,required:any}>}
 * Imported module, resolved record, and required export.
 */
export async function importLedgerModule(record) {
  const resolved = resolveModuleRecord(record);
  const startText = makeModuleStartText(resolved);

  workerImportLog.info(startText);
  postTextToMain("worker_text_log", startText);

  try {
    const module = await import(resolved.relativePath);
    const required = requireModuleExport(module, resolved);
    const successText = makeModuleSuccessText(resolved);

    workerImportLog.info(successText);
    postTextToMain("worker_text_log", successText);

    return {
      record: resolved,
      module,
      required
    };
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
