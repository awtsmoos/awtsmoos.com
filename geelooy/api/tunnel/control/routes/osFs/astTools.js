// B"H
const { cleanPath } = require("./path.js");
const { readWhole } = require("./listRead.js");
const { writeFile } = require("./writeOps.js");

const DEF_RE = /(^|\n)([ \t]*(?:\/\*\*[\s\S]*?\*\/\s*)?(?:(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{|(?:export\s+)?class\s+([A-Za-z_$][\w$]*)\s*[^\{]*\{|(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>))/g;
const VAR_RE = /\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/g;
const IMPORT_RE = /\b(?:import\s+(?:[^'\"]+\s+from\s+)?|export\s+[^'\"]+\s+from\s+|import\s*\(\s*)['\"]([^'\"]+)['\"]/g;
const EXPORT_RE = /\bexport\s+(?:default\s+)?(?:function|class|const|let|var)?\s*([A-Za-z_$][\w$]*)?|\bexport\s*\{([^}]+)\}/g;

function lineCol(text, index) {
  const before = text.slice(0, index).split(/\r?\n/);
  return { line: before.length, column: before[before.length - 1].length };
}

function leadingComment(text, start) {
  const before = text.slice(0, start).split(/\r?\n/).slice(-8).join("\n");
  const jsdoc = before.match(/\/\*\*[\s\S]*?\*\/\s*$/);
  if (jsdoc) return jsdoc[0].trim().slice(0, 800);
  const lines = before.split(/\r?\n/).reverse();
  const comments = [];
  for (const line of lines) {
    if (/^\s*\/\//.test(line)) comments.unshift(line.trim());
    else if (line.trim()) break;
  }
  return comments.join("\n").slice(0, 800);
}

function findMatchingBrace(text, openIndex) {
  let depth = 0, quote = null, esc = false, line = false, block = false;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (line) { if (ch === "\n") line = false; continue; }
    if (block) { if (ch === "*" && next === "/") { block = false; i++; } continue; }
    if (quote) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === quote) quote = null; continue; }
    if (ch === "/" && next === "/") { line = true; i++; continue; }
    if (ch === "/" && next === "*") { block = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

function outlineText(text, path = "") {
  const imports = collect(IMPORT_RE, text, m => ({ spec: m[1], loc: lineCol(text, m.index) }));
  const variables = collect(VAR_RE, text, m => ({ name: m[1], loc: lineCol(text, m.index) }));
  const exports = collect(EXPORT_RE, text, m => ({ name: (m[1] || m[2] || "").trim(), loc: lineCol(text, m.index) }));
  const symbols = [];
  DEF_RE.lastIndex = 0;
  let m;
  while ((m = DEF_RE.exec(text))) {
    const name = m[3] || m[4] || m[5];
    const start = m.index + (m[1] ? 1 : 0);
    const open = text.indexOf("{", DEF_RE.lastIndex - 1);
    const close = open >= 0 ? findMatchingBrace(text, open) : -1;
    symbols.push({ name, kind: m[3] ? "function" : m[4] ? "class" : "arrow", loc: lineCol(text, start), range: { start, end: close >= 0 ? close + 1 : DEF_RE.lastIndex }, bodyRange: open >= 0 && close >= 0 ? { start: open + 1, end: close } : null, comment: leadingComment(text, start) });
  }
  return { ok: true, action: "astOutline", parser: "awtsmoos-regex-balanced", path: cleanPath(path || "."), imports, exports, variables: variables.slice(0, 500), symbols: symbols.slice(0, 500) };
}

function collect(re, text, map) {
  const out = []; re.lastIndex = 0; let m;
  while ((m = re.exec(text)) && out.length < 500) out.push(map(m));
  return out;
}

async function astOutline($i, userId, payload) {
  const p = payload.path || payload.p || ".";
  const got = await readWhole($i, userId, p);
  return outlineText(got.content || "", p);
}

async function astEdit($i, userId, payload) {
  const p = payload.path || payload.p;
  const got = await readWhole($i, userId, p);
  const text = got.content || "";
  const outline = outlineText(text, p);
  const name = payload.name || payload.functionName || payload.symbol;
  const symbol = outline.symbols.find(s => s.name === name);
  if (!symbol) return { ok: false, action: payload.action || "astEdit", error: "symbol_not_found", name, symbols: outline.symbols.map(s => s.name).slice(0, 80) };
  let next = text;
  const content = String(payload.content ?? payload.replacement ?? payload.body ?? "");
  if (payload.action === "replaceFunctionBody") next = text.slice(0, symbol.bodyRange.start) + "\n" + content + "\n" + text.slice(symbol.bodyRange.end);
  else if (payload.action === "insertBeforeFunction") next = text.slice(0, symbol.range.start) + content + "\n" + text.slice(symbol.range.start);
  else if (payload.action === "insertAfterFunction") next = text.slice(0, symbol.range.end) + "\n" + content + text.slice(symbol.range.end);
  else next = text.slice(0, symbol.range.start) + content + text.slice(symbol.range.end);
  const wr = await writeFile($i, userId, { ...payload, path: p, content: next });
  return { ...wr, action: payload.action || "replaceFunction", editedSymbol: symbol, astOutline: outlineText(next, p) };
}

module.exports = { astOutline, astEdit, outlineText };
