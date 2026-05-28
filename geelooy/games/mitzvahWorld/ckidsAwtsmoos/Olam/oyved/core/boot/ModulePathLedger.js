// B"H
/**
 * @file ModulePathLedger.js
 * @description
 * Chapter 5: Worker boot module paths with cache freshness.
 *
 * The Worker imports the real Olam class directly, and the Olam path carries a
 * version key so loader-warning and terrain/control fixes reach a fresh worker
 * after a hard refresh.
 */

export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key: "olamCore",
    label: "Olam core direct vessel",
    relativePath: "../../../core/OlamVessel.js?v=lean-l1-20260528-bh8",
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js",
    requiredExport: "default"
  }),

  utilsCore: Object.freeze({
    key: "utilsCore",
    label: "Awtsmoos utils",
    relativePath: "../../../../utils.js",
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport: "default"
  })
});

export const MODULE_BOOT_ORDER = Object.freeze([
  MODULE_PATH_LEDGER.olamCore,
  MODULE_PATH_LEDGER.utilsCore
]);
