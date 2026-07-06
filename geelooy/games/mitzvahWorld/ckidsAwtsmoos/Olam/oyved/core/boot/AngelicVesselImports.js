// B"H
/** @file AngelicVesselImports.js @description Fresh worker vessel imports with case-safe Olam URLs. */
import { MODULE_PATH_LEDGER } from "./ModulePathLedger.js?v=case-correct-olam-import-20260706-bh1";
import { importLedgerModule } from "./SafeModuleImport.js?v=case-correct-olam-import-20260706-bh1";
export async function importOlamCore() { return await importLedgerModule(MODULE_PATH_LEDGER.olamCore); }
export async function importUtilsCore() { return await importLedgerModule(MODULE_PATH_LEDGER.utilsCore); }
export async function importAngelicVesselsInOrder() { const olam = await importOlamCore(); const utils = await importUtilsCore(); return { olamModule:olam.module, utilsModule:utils.module, OlamClass:olam.required, UtilsClass:utils.required }; }
