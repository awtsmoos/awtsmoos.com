// B"H
/** @file ModulePathLedger.js @description Worker boot module ledger: import the public Olam module as an ES module, never a raw script vessel. */
export const MODULE_BOOT_VERSION = "worker-module-olam-index-fix-20260708-bh6";

export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key: "olamCore",
    label: "Olam public module vessel",
    relativePath: "../../../index.js?compact=true&v=" + MODULE_BOOT_VERSION,
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/index.js",
    requiredExport: "default"
  }),
  utilsCore: Object.freeze({
    key: "utilsCore",
    label: "Awtsmoos utils",
    relativePath: "../../../../utils.js?compact=true&v=" + MODULE_BOOT_VERSION,
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport: "default"
  })
});

export const MODULE_BOOT_ORDER = Object.freeze([
  MODULE_PATH_LEDGER.olamCore,
  MODULE_PATH_LEDGER.utilsCore
]);
