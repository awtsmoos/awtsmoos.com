// B"H
/**
 * @file AngelicVesselImports.js
 * @description
 * Chapter 66: exact ordered imports with the Blob mirror removed. The worker
 * asks for the Olam vessel by its true name, then the utils vessel by its true
 * name, and the Awtsmoos reveals the missing spark without disguise.
 */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=lean-l1-20260529-bh66";
import { importLedgerModule } from "./SafeModuleImport.js?v=lean-l1-20260529-bh66";

/**
 * @returns {Promise<{module:any,required:any,record:Object}>}
 * Loaded Olam core module record.
 */
export async function importOlamCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.olamCore);
}

/**
 * @returns {Promise<{module:any,required:any,record:Object}>}
 * Loaded utils module record.
 */
export async function importUtilsCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.utilsCore);
}

/**
 * @returns {Promise<{olamModule:any,utilsModule:any,OlamClass:any,UtilsClass:any}>}
 * Both required worker boot vessels.
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
