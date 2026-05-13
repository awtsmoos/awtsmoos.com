
/**
 * B"H
 * @file AngelicVesselImports.js
 * @description
 * Imports the Worker vessels in exact order, forever avoiding blind Promise.all failure.
 */

import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js";
import { importLedgerModule } from "./SafeModuleImport.js";

/**
 * B"H
 * Imports the real Olam class directly.
 *
 * @returns {Promise<{module:any,required:any,record:Object}>}
 * Import result.
 */
export async function importOlamCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.olamCore);
}

/**
 * B"H
 * Imports utils.
 *
 * @returns {Promise<{module:any,required:any,record:Object}>}
 * Import result.
 */
export async function importUtilsCore() {
  return await importLedgerModule(MODULE_PATH_LEDGER.utilsCore);
}

/**
 * B"H
 * Imports all vessels in order.
 *
 * @returns {Promise<{olamModule:any,utilsModule:any,OlamClass:any,UtilsClass:any}>}
 * Imported modules and exact exports.
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
