// B"H
// Blessed is He
// Boruch Hashem

/**
 * @module LineLimitGuard
 * @description
 * Enforces Yaakov's coding law at the tunnel level (2026-10-19): NO file may
 * ever exceed 120 lines. This guard is NON-NEGOTIABLE - every tunnel file
 * write funnels through checkLineLimit(), and anything over the limit is
 * BLOCKED with a loud error telling the agent to break it into modules.
 * Binary (non-string) payloads are exempt - line counts do not apply to them.
 */

const MAX_LINES = 120;

/**
 * Counts the lines in a string of file content.
 * @param {string} content - File content to measure.
 * @returns {number} Line count (1 for empty or single-line content).
 */
function countLines(content) {
  const s = String(content ?? "");
  if (!s) return 1;
  return s.split("\n").length;
}

/**
 * Checks file content against the 120-line law.
 * @param {string} filePath - Path being written (for the error message).
 * @param {*} content - Content about to be written.
 * @returns {object|null} Null when allowed; a BLOCK error object when denied.
 */
function checkLineLimit(filePath, content) {
  if (typeof content !== "string") return null;
  const lines = countLines(content);
  if (lines <= MAX_LINES) return null;
  return {
    ok: false,
    error: "FILE_TOO_LONG_BLOCKED",
    path: filePath,
    lines,
    maxLines: MAX_LINES,
    message:
      "BLOCKED: files may never exceed 120 lines (" + lines + " given). " +
      "Break it into smaller modules under 120 lines each, with JSDoc comments, " +
      "and write them one at a time. This limit is enforced at the tunnel level " +
      "and is non-negotiable."
  };
}

module.exports = { MAX_LINES, countLines, checkLineLimit };
