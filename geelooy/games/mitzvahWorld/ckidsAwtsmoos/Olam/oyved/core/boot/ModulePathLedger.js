// B"H
/** Worker boot ledger: imports Olam through the public Olam gate. */
export const MODULE_BOOT_VERSION = "olam-public-gate-fixed-20260709-bh1";
export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key:"olamCore",
    label:"Olam public gate",
    relativePath:"../../../index.js",
    expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/Olam/index.js",
    requiredExport:"default"
  }),
  utilsCore: Object.freeze({
    key:"utilsCore",
    label:"Awtsmoos utils",
    relativePath:"../../../../utils.js",
    expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport:"default"
  })
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
