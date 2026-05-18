// B"H
const { probeId } = require("./probeId.js");

function safeExpr(expr) {
  return String(expr || "").replace(/[;\n\r]/g, "");
}

function captureLine(probe, index) {
  const label = JSON.stringify(probeId(probe, index));
  const variable = safeExpr(probe.variable || probe.capture);
  if (!variable) return "";
  const capture = '(typeof __merkavaProbeCapture !== "undefined" ? __merkavaProbeCapture : window.__merkavaProbeCapture)';
  return `${capture}(${label}, (typeof ${variable} !== "undefined" ? ${variable} : undefined));`;
}

/**
 * B"H
 * Inserts line probe captures before the requested line.
 *
 * @param {string} file File key.
 * @param {string} source JS source.
 * @param {Array<object>} probes Probes for the file.
 * @returns {string} Instrumented source.
 */
function instrumentSource(file, source, probes = []) {
  const lines = String(source || "").split(/\r?\n/g);
  const mapped = probes
    .map((probe, index) => ({ probe, index, line: Number(probe.line || 0) }))
    .filter(item => item.probe.file === file && item.line > 0);

  for (const item of mapped.sort((a, b) => b.line - a.line)) {
    const insertAt = Math.max(0, Math.min(lines.length, item.line - 1));
    const snap = captureLine(item.probe, item.index);
    if (snap) lines.splice(insertAt, 0, snap);
  }

  return lines.join("\n");
}

module.exports = { instrumentSource };
