// B"H
/** @file ModulePathLedger.js @description Worker boot imports the corrected Olam vessel with fresh cache keys. */
export const MODULE_BOOT_VERSION = "mobile-world-boot-vessel-20260626-bh1";
export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({ key:"olamCore", label:"Olam core direct vessel", relativePath:"../../../core/OlamVessel.js?v=mobile-world-boot-exports-20260626-bh1", expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport:"default" }),
  utilsCore: Object.freeze({ key:"utilsCore", label:"Awtsmoos utils", relativePath:"../../../../utils.js?v=mobile-world-boot-20260626-bh1", expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/utils.js", requiredExport:"default" })
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
