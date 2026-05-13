
/**
 * B"H
 * @file OlamBootContractReport.js
 * @description
 * Pure text report for permanent Olam boot assumptions.
 */

/**
 * B"H
 * Builds the Olam boot contract report.
 *
 * @returns {string}
 * Plain text report.
 */
export function getOlamBootContractReport() {
  return [
    "Olam boot contract report",
    "Real class file=/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js",
    "Required export=default",
    "Compatibility file=/games/mitzvahWorld/ckidsAwtsmoos/Olam/index.js",
    "Compatibility export=default OlamVessel",
    "Do not import=/games/mitzvahWorld/ckidsAwtsmoos/Olam/core.js as default",
    "Reason=core.js exports named heescheel only",
    "ServerSideFilesEver=false"
  ].join(" || ");
}
