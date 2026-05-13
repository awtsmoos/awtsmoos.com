
/**
 * B"H
 * @file OlamIndexContract.js
 * @description
 * Text-only diagnostics for the Olam index compatibility contract.
 */

/**
 * B"H
 * Gets the fixed Olam index contract.
 *
 * @returns {string}
 * Diagnostic text.
 */
export function getOlamIndexContractText() {
  return [
    "Olam index contract",
    "Compatibility file=/games/mitzvahWorld/ckidsAwtsmoos/Olam/index.js",
    "Compatibility behavior=imports ./core/OlamVessel.js and default-exports it",
    "Worker permanent behavior=imports /games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js directly",
    "Broken old behavior=imported ./core.js even though core.js only exports named heescheel",
    "ServerSideFilesEver=false"
  ].join(" || ");
}
