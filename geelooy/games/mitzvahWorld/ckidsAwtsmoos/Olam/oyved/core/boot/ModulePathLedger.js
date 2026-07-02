// B"H
/** Worker boot paths: compact mode, cache-busted, direct core vessels. */
export const MODULE_BOOT_VERSION = "house-solid-loader-compact-20260702-bh3";
export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({ key: "olamCore", label: "Olam core direct vessel", relativePath: "../../../core/OlamVessel.js?v=house-solid-loader-compact-20260702-bh3", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport: "default" }),
  utilsCore: Object.freeze({ key: "utilsCore", label: "Awtsmoos utils", relativePath: "../../../../utils.js?v=house-solid-loader-compact-20260702-bh3", expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js", requiredExport: "default" })
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
