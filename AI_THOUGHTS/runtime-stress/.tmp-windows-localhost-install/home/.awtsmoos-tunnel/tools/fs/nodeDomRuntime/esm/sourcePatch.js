// B"H
/**
 * @file sourcePatch.js
 * @description Chapter 368: The source was not torn by guesswork. Patches are
 * sorted backward, so every AST span keeps its ordained place.
 */
function applyPatches(source, patches) {
  let out = String(source || "");
  for (const p of [...patches].sort((a, b) => b.start - a.start)) out = out.slice(0, p.start) + p.text + out.slice(p.end);
  return out;
}
function patch(start, end, text) { return { start: Number(start), end: Number(end), text: String(text || "") }; }
module.exports = { applyPatches, patch };
