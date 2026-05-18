// B"H
const { cleanPath } = require("./path.js");
const { readWhole } = require("./listRead.js");

const IMPORT_RE = /\b(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g;
const SYM_RES = [
  { kind: "function", re: /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g },
  { kind: "class", re: /\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g },
  { kind: "arrow", re: /\b(?:const|let|var)\s+([A-Za-z$_][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\}|[A-Za-z_$][\w$]*)\s*=>/g }
];

function lineCol(text, index) {
  const before = text.slice(0, index).split(/\r?\n/);
  return { line: before.length, column: before[before.length - 1].length };
}

function symbols(text) {
  const out = [];
  for (const def of SYM_RES) {
    def.re.lastIndex = 0;
    let m;
    while ((m = def.re.exec(text))) out.push({ name: m[1], kind: def.kind, index: m.index, loc: lineCol(text, m.index) });
  }
  return out.sort((a, b) => a.index - b.index).slice(0, 300);
}

function imports(text) {
  const out = [];
  IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = IMPORT_RE.exec(text))) out.push({ spec: m[1], index: m.index, loc: lineCol(text, m.index) });
  return out.slice(0, 300);
}

/**
 * B"H
 * Gives the hosted virtual OS a small semantic eye when the local agent and Code tab are absent.
 * It chooses safety over boasting: known symbols, import edges, and parser name only.
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Owner identity.
 * @param {object} payload Action payload.
 * @returns {Promise<object>} Semantic outline.
 */
async function astOutline($i, userId, payload) {
  const got = await readWhole($i, userId, payload.path || payload.p || ".");
  const text = got.content || "";
  return {
    ok: true,
    action: "astOutline",
    parser: "awtsmoos-os-light",
    path: cleanPath(payload.path || "."),
    imports: imports(text),
    symbols: symbols(text)
  };
}

async function semanticSearch($i, userId, payload) {
  const got = await readWhole($i, userId, payload.path || payload.p || ".");
  const q = String(payload.query || payload.q || "").toLowerCase();
  const lines = got.content.split(/\r?\n/);
  const results = [];
  for (let i = 0; i < lines.length && results.length < Number(payload.limit || 80); i++) {
    if (q && lines[i].toLowerCase().includes(q)) results.push({ line: i + 1, preview: lines[i].slice(0, 500) });
  }
  return { ok: true, action: "semanticSearch", path: cleanPath(payload.path || "."), query: q, results };
}

module.exports = { astOutline, semanticSearch };
