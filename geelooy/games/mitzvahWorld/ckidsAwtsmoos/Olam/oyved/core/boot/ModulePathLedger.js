// B"H
/**
 * @file ModulePathLedger.js
 * @description Declares the worker boot modules before URL resolution.
 */

export const MODULE_BOOT_VERSION = "mobile-parser-safe-loader-calm-20260708-bh1";

export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key: "olamCore",
    label: "Olam core direct vessel",
    relativePath: `../../../core/OlamVessel.js?v=${MODULE_BOOT_VERSION}`,
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js",
    requiredExport: "default"
  }),
  utilsCore: Object.freeze({
    key: "utilsCore",
    label: "Awtsmoos utils",
    relativePath: `../../../../utils.js?compact=true&v=${MODULE_BOOT_VERSION}`,
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport: "default"
  })
});

export const MODULE_BOOT_ORDER = Object.freeze([
  MODULE_PATH_LEDGER.olamCore,
  MODULE_PATH_LEDGER.utilsCore
]);
