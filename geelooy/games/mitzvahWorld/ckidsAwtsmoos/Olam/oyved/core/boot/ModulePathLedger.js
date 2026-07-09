// B"H
/** Worker boot module ledger for the active tested Olam gate. */
export const MODULE_BOOT_VERSION = "actual-tested-live-gates-20260709-bh5";
export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key:"olamCore",
    label:"Olam public module vessel",
    relativePath:"../../../index.js?compact=true&v=" + MODULE_BOOT_VERSION,
    expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/Olam/index.js",
    requiredExport:"default"
  }),
  utilsCore: Object.freeze({
    key:"utilsCore",
    label:"Awtsmoos utils",
    relativePath:"../../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1",
    expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport:"default"
  })
});
export const MODULE_BOOT_ORDER = Object.freeze([MODULE_PATH_LEDGER.olamCore, MODULE_PATH_LEDGER.utilsCore]);
