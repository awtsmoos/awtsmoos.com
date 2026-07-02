// B"H
/** @file AngelicVesselImports.js @description Fresh worker vessel imports bypass stale mobile cache. */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=production-vessel-refresh-20260702-bh1";
import { importLedgerModule } from "./SafeModuleImport.js?v=production-vessel-refresh-20260702-bh1";

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
  return { olamModule:olam.module, utilsModule:utils.module, OlamClass:olam.required, UtilsClass:utils.required };
}
