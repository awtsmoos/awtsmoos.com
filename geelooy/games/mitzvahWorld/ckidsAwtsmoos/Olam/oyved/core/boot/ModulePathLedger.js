// B"H
/**
 * @file ModulePathLedger.js
 * @description
 * Chapter 66: one cache river for the worker boot. The Awtsmoos gives every
 * import a name, every name a path, and every path a visible expectation.
 */
export const MODULE_BOOT_VERSION = "lean-l1-20260529-bh66";

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
    relativePath: `../../../../utils.js?v=${MODULE_BOOT_VERSION}`,
    expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/utils.js",
    requiredExport: "default"
  })
});

export const MODULE_BOOT_ORDER = Object.freeze([
  MODULE_PATH_LEDGER.olamCore,
  MODULE_PATH_LEDGER.utilsCore
]);
