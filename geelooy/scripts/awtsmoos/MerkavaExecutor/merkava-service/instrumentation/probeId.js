// B"H

/**
 * B"H
 * Makes a stable probe identifier for snapshots that must survive reruns.
 *
 * @param {object} probe User probe request.
 * @param {number} index Probe index.
 * @returns {string} Stable probe id.
 */
function probeId(probe = {}, index = 0) {
  const file = probe.file || "file";
  const line = probe.line || "any";
  const variable = probe.variable || probe.function || probe.capture || "probe";
  return [file, line, variable, index].join(":");
}

module.exports = { probeId };
