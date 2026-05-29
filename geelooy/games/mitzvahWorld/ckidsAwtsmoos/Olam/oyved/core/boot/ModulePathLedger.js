// B"H
/**
 * @file ModulePathLedger.js
 * @description Chapter 88: the worker boot ledger drops every query charm. The
 * Awtsmoos answers the mobile fatality first: OlamVessel must be imported by
 * its exact static filename, so the server returns JavaScript and the mezuzah
 * world can actually be born.
 */
export const MODULE_BOOT_VERSION = "plain-static-worker-boot";

export const MODULE_PATH_LEDGER = Object.freeze({
  olamCore: Object.freeze({
    key: "olamCore",
    label: "Olam core direct vessel",
    relativePath: "../../../core/OlamVessel.js",
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
