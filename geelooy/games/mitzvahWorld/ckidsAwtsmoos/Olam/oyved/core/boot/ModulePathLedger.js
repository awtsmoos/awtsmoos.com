// B"H
/** @file ModulePathLedger.js @description Chapter 961: worker boot imports world-state and door-runtime exposed Olam vessel. */
export const MODULE_BOOT_VERSION = "world-state-door-runtime-vessel-worker-boot-20260615-bh920";
export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({ key: "olamCore", label: "Olam core direct vessel", relativePath: "../../../core/OlamVessel.js?v=world-state-door-runtime-vessel-20260615-bh920", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport: "default" }),
  utilsCore: Object.freeze({ key: "utilsCore", label: "Awtsmoos utils", relativePath: "../../../../utils.js", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js", requiredExport: "default" })
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
