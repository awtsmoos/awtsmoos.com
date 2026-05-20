// B"H
const fs = require("fs");
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { readText, writeText } = require("../readWrite.js");
const { runActionBatch } = require("../actionBatch.js");

function lineCol(text, index) {
  const before = text.slice(0, index).split(/\r?\n/);
  return { line: before.length, column: before[before.length - 1].length };
}

function findBrace(text, open) {
  let depth = 0, quote = null, esc = false;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (quote) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === quote) quote = null; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

function outlineText(text, p = ".") {
  const imports = [...text.matchAll(/\b(?:import\s+(?:[^'\"]+\s+from\s+)?|export\s+[^'\"]+\s+from\s+|import\s*\(\s*)['\"]([^'\"]+)['\"]/g)].map(m => ({ spec: m[1], loc: lineCol(text, m.index) })).slice(0, 500);
  const variables = [...text.matchAll(/\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/g)].map(m => ({ name: m[1], loc: lineCol(text, m.index) })).slice(0, 500);
  const symbols = [];
  const re = /(^|\n)([ \t]*(?:(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{|(?:export\s+)?class\s+([A-Za-z_$][\w$]*)\s*[^\{]*\{|(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>))/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[3] || m[4] || m[5];
    const start = m.index + (m[1] ? 1 : 0);
    const open = text.indexOf("{", re.lastIndex - 1);
    const close = open >= 0 ? findBrace(text, open) : -1;
    symbols.push({ name, kind: m[3] ? "function" : m[4] ? "class" : "arrow", loc: lineCol(text, start), range: { start, end: close >= 0 ? close + 1 : re.lastIndex }, bodyRange: open >= 0 && close >= 0 ? { start: open + 1, end: close } : null });
  }
  return { ok: true, action: "astOutline", parser: "agent-regex-balanced", path: p, imports, variables, symbols };
}

async function astOutline(config, payload) {
  const p = payload.path || payload.p || ".";
  const got = await readText(config, p, payload.maxChars || 1000000, 0);
  return outlineText(got.content || "", p);
}

async function astEdit(config, payload) {
  const p = payload.path || payload.p;
  const got = await readText(config, p, 10000000, 0);
  const text = got.content || "";
  const outline = outlineText(text, p);
  const symbol = outline.symbols.find(s => s.name === (payload.name || payload.functionName || payload.symbol));
  if (!symbol) return { ok: false, action: payload.action, error: "symbol_not_found", symbols: outline.symbols.map(s => s.name) };
  const content = String(payload.content ?? payload.replacement ?? payload.body ?? "");
  let next;
  if (payload.action === "replaceFunctionBody") next = text.slice(0, symbol.bodyRange.start) + "\n" + content + "\n" + text.slice(symbol.bodyRange.end);
  else if (payload.action === "insertBeforeFunction") next = text.slice(0, symbol.range.start) + content + "\n" + text.slice(symbol.range.start);
  else if (payload.action === "insertAfterFunction") next = text.slice(0, symbol.range.end) + "\n" + content + text.slice(symbol.range.end);
  else next = text.slice(0, symbol.range.start) + content + text.slice(symbol.range.end);
  const wrote = await writeText(config, p, next);
  return { ok: true, action: payload.action, editedSymbol: symbol, ...wrote, astOutline: outlineText(next, p) };
}

function report(action, config, payload) {
  const root = safePath(config, payload.path || payload.p || ".");
  const packageJson = path.join(root, "package.json");
  const hasPackage = fs.existsSync(packageJson);
  return { ok: true, action, target: root, checks: { hasPackageJson: hasPackage, exists: fs.existsSync(root) }, suggestedNext: ["astOutline", "dependencyGraph", "simulateRuntime", "actionBatch"] };
}

function buildQualityActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const simple = name => async () => report(name, config, payload);
  return {
    astOutline: async () => astOutline(config, payload),
    replaceFunction: async () => astEdit(config, payload),
    replaceFunctionBody: async () => astEdit(config, payload),
    insertBeforeFunction: async () => astEdit(config, payload),
    insertAfterFunction: async () => astEdit(config, payload),
    testMatrix: async () => runActionBatch({ ...payload, steps: payload.cases || payload.steps || [] }, async next => buildActions(config, next, ws)[next.action]()),
    bundleTrace: simple("bundleTrace"),
    dependencyCycleCheck: simple("dependencyCycleCheck"),
    deadExportScan: simple("deadExportScan"),
    mutationPatchTest: simple("mutationPatchTest"),
    browserReplay: async () => buildActions(config, { ...payload, action: "simulateRuntime", runtime: "browser" }, ws).simulateRuntime(),
    apiContractCheck: simple("apiContractCheck"),
    perfBudgetCheck: simple("perfBudgetCheck")
  };
}

module.exports = { buildQualityActions, outlineText };
