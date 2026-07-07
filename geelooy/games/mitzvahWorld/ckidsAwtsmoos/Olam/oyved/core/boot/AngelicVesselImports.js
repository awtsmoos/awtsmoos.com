// B"H
/**
 * @file AngelicVesselImports.js
 * @description Ordered imports for the worker's canonical core vessels.
 */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=case-correct-olam-import-20260706-bh3";
import { importLedgerModule } from "./SafeModuleImport.js?v=case-correct-olam-import-20260706-bh3";

/** @returns {Promise<object>} B"H Olam core import record. */
export function importOlamCore() {
  return importLedgerModule(MODULE_PATH_LEDGER.olamCore);
}

/** @returns {Promise<object>} B"H utility core import record. */
export function importUtilsCore() {
  return importLedgerModule(MODULE_PATH_LEDGER.utilsCore);
}

/**
 * B"H
 * Imports Olam before utils so the main class failure is reported first.
 *
 * @returns {Promise<{olamModule:object,utilsModule:object,OlamClass:Function,UtilsClass:Function}>}
 */
export async function importAngelicVesselsInOrder() {
  const olam = await importOlamCore();
  const utils = await importUtilsCore();
  return {
    olamModule: olam.module,
    utilsModule: utils.module,
    OlamClass: olam.required,
    UtilsClass: utils.required
  };
}
