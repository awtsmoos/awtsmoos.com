// B"H
/**
 * @file AngelicVesselImports.js
 * @description Chapter 88: vessel imports read the plain static ledger. The
 * Awtsmoos summons OlamVessel and utils by exact filenames so mobile Chrome
 * receives JavaScript, not JSON error bodies.
 */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=starter-contracts-20260628-bh9";
import { importLedgerModule } from "./SafeModuleImport.js";

/** @returns {Promise<{module:any,required:any,record:Object}>} Loaded Olam core module record. */
export async function importOlamCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.olamCore);
}

/** @returns {Promise<{module:any,required:any,record:Object}>} Loaded utils module record. */
export async function importUtilsCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.utilsCore);
}

/** @returns {Promise<{olamModule:any,utilsModule:any,OlamClass:any,UtilsClass:any}>} Both worker boot vessels. */
export async function importAngelicVesselsInOrder() {
  const olam = await importOlamCore();
  const utils = await importUtilsCore();
  return { olamModule: olam.module, utilsModule: utils.module, OlamClass: olam.required, UtilsClass: utils.required };
}
