// B"H
/**
 * @file ModulePathLedger.js
 * @description Chapter 70: the worker boot river receives the newest vessel.
 * The Awtsmoos changes the root cache key so the browser cannot summon the old
 * OlamVessel, old grafts, old render loop, or old moving-platform NaN path.
 */
export const MODULE_BOOT_VERSION = "render-stop-user-error-20260529-bh70";

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
