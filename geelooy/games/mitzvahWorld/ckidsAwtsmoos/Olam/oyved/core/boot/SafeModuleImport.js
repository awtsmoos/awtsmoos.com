// B"H
/**
 * @file SafeModuleImport.js
 * @description
 * Chapter 67: When an import becomes a silent prison, the Awtsmoos breaks the
 * wall with named progress and a generous timeout. No more boxing, no more
 * invisible waiting: every vessel says which URL it enters and whether it came
 * back from the mist.
 */
import { workerImportLog, postTextToMain } from "../log/WorkerTextLogger.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";
import { resolveModuleRecord } from "./ModuleUrlResolver.js";
import { makeModuleFailureText, makeModuleStartText, makeModuleSuccessText } from "./ModuleLoadText.js";
import { requireModuleExport } from "./ModuleExportValidator.js";

const IMPORT_TIMEOUT_MS = 120000;

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
  postWorkerProgress(`module:${resolved.key || resolved.label}:import:start`);
  const module = await Promise.race([import(resolved.url), timeoutImport(resolved)]);
  postWorkerProgress(`module:${resolved.key || resolved.label}:import:done`);
  return module;
}

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
