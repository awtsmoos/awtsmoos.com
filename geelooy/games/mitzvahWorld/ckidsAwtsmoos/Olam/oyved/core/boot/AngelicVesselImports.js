// B"H
/** Ordered imports for direct worker core vessels. */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js";
import { importLedgerModule } from "./SafeModuleImport.js";
export function importOlamCore() { return importLedgerModule(MODULE_PATH_LEDGER.olamCore); }
export function importUtilsCore() { return importLedgerModule(MODULE_PATH_LEDGER.utilsCore); }
export async function importAngelicVesselsInOrder() {
  const olam = await importOlamCore();
  const utils = await importUtilsCore();
  return { olamModule:olam.module, utilsModule:utils.module, OlamClass:olam.required, UtilsClass:utils.required };
}
