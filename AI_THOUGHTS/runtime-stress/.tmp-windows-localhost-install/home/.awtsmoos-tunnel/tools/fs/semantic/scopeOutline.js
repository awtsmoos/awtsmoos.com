// B"H
const { findBrace, lineCol, shortHash } = require("./balancedScopes.js");

function makeScope(text, data) {
  const body = data.bodyRange ? text.slice(data.bodyRange.start, data.bodyRange.end) : "";
  const whole = text.slice(data.range.start, data.range.end);
  const classPart = data.className ? `:${data.className}` : "";
  const idSeed = `${data.kind}${classPart}:${data.name}:${data.range.start}:${shortHash(whole)}`;
  return {
    scopeId: `${data.kind}${classPart}:${data.name}:${shortHash(idSeed)}`,
    name: data.name,
    kind: data.kind,
    className: data.className || null,
    loc: lineCol(text, data.range.start),
    range: data.range,
    bodyRange: data.bodyRange,
    signatureHash: shortHash(whole.slice(0, Math.min(240, whole.length))),
    bodyHash: shortHash(body),
    textHash: shortHash(whole)
  };
}

function collectRootSymbols(text) {
  const symbols = [];
  const re = /(^|\n)([ \t]*(?:(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{|(?:export\s+)?class\s+([A-Za-z_$][\w$]*)\s*[^\{]*\{|(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>))/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[3] || m[4] || m[5];
    const start = m.index + (m[1] ? 1 : 0);
    const open = text.indexOf("{", re.lastIndex - 1);
    const close = open >= 0 ? findBrace(text, open) : -1;
    const kind = m[3] ? "function" : m[4] ? "class" : "arrow";
    const range = { start, end: close >= 0 ? close + 1 : re.lastIndex };
    const bodyRange = open >= 0 && close >= 0 ? { start: open + 1, end: close } : null;
    symbols.push(makeScope(text, { name, kind, range, bodyRange }));
  }
  return symbols;
}

function collectMethods(text, classScope) {
  if (classScope.kind !== "class" || !classScope.bodyRange) return [];
  const body = text.slice(classScope.bodyRange.start, classScope.bodyRange.end);
  const re = /(^|\n)([ \t]*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{)/g;
  const skip = new Set(["if", "for", "while", "switch", "catch", "function"]);
  const methods = [];
  let m;
  while ((m = re.exec(body))) {
    const name = m[3];
    if (skip.has(name)) continue;
    const start = classScope.bodyRange.start + m.index + (m[1] ? 1 : 0);
    const open = text.indexOf("{", classScope.bodyRange.start + re.lastIndex - 1);
    const close = open >= 0 ? findBrace(text, open) : -1;
    if (close < 0 || close > classScope.bodyRange.end) continue;
    methods.push(makeScope(text, {
      name,
      kind: "method",
      className: classScope.name,
      range: { start, end: close + 1 },
      bodyRange: { start: open + 1, end: close }
    }));
  }
  return methods;
}

/**
 * B"H
 * Outlines functions, classes, arrows, and class methods with stable scope IDs.
 *
 * @param {string} text Source code.
 * @param {string} p Display path.
 * @returns {object} Semantic outline.
 */
function scopeOutlineFromText(text, p = ".") {
  const imports = [...text.matchAll(/\b(?:import\s+(?:[^'\"]+\s+from\s+)?|export\s+[^'\"]+\s+from\s+|import\s*\(\s*)['\"]([^'\"]+)['\"]/g)]
    .map(m => ({ spec: m[1], loc: lineCol(text, m.index) })).slice(0, 500);
  const variables = [...text.matchAll(/\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/g)]
    .map(m => ({ name: m[1], loc: lineCol(text, m.index) })).slice(0, 500);
  const rootSymbols = collectRootSymbols(text);
  const methodSymbols = rootSymbols.flatMap(s => collectMethods(text, s));
  return { ok: true, parser: "agent-balanced-scope-v2", path: p, imports, variables, symbols: [...rootSymbols, ...methodSymbols] };
}

module.exports = { scopeOutlineFromText };
