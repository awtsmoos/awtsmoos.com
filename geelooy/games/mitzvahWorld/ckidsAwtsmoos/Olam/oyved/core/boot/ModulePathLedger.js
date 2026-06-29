// B"H
/** @file ModulePathLedger.js @description Worker boot imports the corrected Olam vessel with fresh cache keys. */
export const MODULE_BOOT_VERSION = "mobile-world-boot-vessel-20260626-bh1";
export const MODULE_PATH_LEDGER = Object.freeze({
<<<<<<< HEAD
  olamCore: Object.freeze({ key: "olamCore", label: "Olam core direct vessel", relativePath: "../../../core/OlamVessel.js?v=starter-contracts-20260628-bh9", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport: "default" }),
  utilsCore: Object.freeze({ key: "utilsCore", label: "Awtsmoos utils", relativePath: "../../../../utils.js", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js", requiredExport: "default" })
=======
  olamCore: Object.freeze({ key:"olamCore", label:"Olam core direct vessel", relativePath:"../../../core/OlamVessel.js?v=mobile-world-boot-exports-20260626-bh1", expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport:"default" }),
  utilsCore: Object.freeze({ key:"utilsCore", label:"Awtsmoos utils", relativePath:"../../../../utils.js?v=mobile-world-boot-20260626-bh1", expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/utils.js", requiredExport:"default" })
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
