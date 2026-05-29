// B"H
/**
 * @file AngelicVesselImports.js
 * @description Chapter 75: exact ordered imports with no stale ledger. The
 * Awtsmoos summons the Olam vessel by its true current name, so dimensions are
 * not interpreted by yesterday's tiny-cube boot path.
 */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { importLedgerModule } from "./SafeModuleImport.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
