// B"H
/** Ordered imports for active tested worker core vessels. */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
import { importLedgerModule } from "./SafeModuleImport.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
export function importOlamCore() { return importLedgerModule(MODULE_PATH_LEDGER.olamCore); }
export function importUtilsCore() { return importLedgerModule(MODULE_PATH_LEDGER.utilsCore); }
export async function importAngelicVesselsInOrder() { const olam = await importOlamCore(); const utils = await importUtilsCore(); return { olamModule:olam.module, utilsModule:utils.module, OlamClass:olam.required, UtilsClass:utils.required }; }
