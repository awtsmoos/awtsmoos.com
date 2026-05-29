// B"H
/**
 * @file ModulePathLedger.js
 * @description Chapter 75: the worker boot river is no longer allowed to carry
 * an old vessel beneath a new sky. The Awtsmoos names one cache key for the
 * entire platform-size revelation, so the Olam core, grafts, loader, and moving
 * platform constructor arrive in the same living instant.
 */
export const MODULE_BOOT_VERSION = "wide-platform-real-boot-chain-20260529-bh75";

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
