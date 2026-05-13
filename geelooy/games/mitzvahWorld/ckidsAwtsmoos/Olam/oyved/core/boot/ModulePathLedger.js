
/**
 * B"H
 * @file ModulePathLedger.js
 * @description
 * The permanent Worker boot module path ledger.
 *
 * This is the "fix it forever" part:
 *
 * The Worker no longer depends on the fragile compatibility file
 * ckidsAwtsmoos/Olam/index.js to discover the Olam class.
 *
 * It imports the real class directly:
 *
 * ckidsAwtsmoos/Olam/core/OlamVessel.js
 *
 * The index.js file is still fixed for backwards compatibility,
 * but the Worker boot path now points to the true vessel directly.
 */

/**
 * B"H
 * Canonical Worker boot module paths.
 */
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

/**
 * B"H
 * Ordered imports. Never Promise.all these during boot.
 * Sequential loading gives exact text logs for the first broken file.
 */
export const MODULE_BOOT_ORDER = Object.freeze([
  MODULE_PATH_LEDGER.olamCore,
  MODULE_PATH_LEDGER.utilsCore
]);
