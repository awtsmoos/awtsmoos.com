// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache", "coverage"]);
const HOT = new Set(["src", "app", "apps", "lib", "tools", "systems", "components", "pages", "api", "scripts", "test", "tests"]);

/**
 * B"H
 * Chapter 472: Before the search descended, the path itself began to glow.
 * The Awtsmoos teaches the agent to ask: where should I look first? Names,
 * segments, hot folders, and nearby config scrolls now become ranked search
 * roots, with executable next requests instead of vague advice.
 */
function tokens(payload = {}) {
  const text = [payload.query, payload.q, payload.find, payload.pattern, payload.pathHint, payload.goal]
    .filter(Boolean).join(" ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return [...new Set(text.split(/[^a-z0-9]+/).filter(x => x.length > 1))];
}

function num(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function relFrom(config, full) {
  const rel = path.relative(config.root, full).replace(/\\/g, "/");
  return rel || ".";
}

function score(rel, kind, toks) {
  const lower = rel.toLowerCase();
  const parts = lower.split(/[\\/._-]+/).filter(Boolean);
  let points = kind === "dir" ? 2 : 1;
  for (const token of toks) {
    if (parts.includes(token)) points += 14;
    else if (lower.includes(token)) points += 6;
  }
  for (const part of parts) if (HOT.has(part)) points += 3;
  if (/package\.json$|vite\.config|next\.config|tsconfig|README/i.test(rel)) points += 2;
  return points;
}

async function pathHints(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const rootPath = payload.path || payload.p || payload.root || ".";
  const root = safePath(config, rootPath);
  const toks = tokens(payload);
  const maxDepth = num(payload.maxDepth, 4, 0, 12);
  const maxEntries = num(payload.maxEntries, 2500, 10, 100000);
  const maxResults = num(payload.maxResults || payload.limit, 24, 1, 200);
  const got = [];
  let visited = 0, skipped = 0;
  await walk(config, root, 0, { toks, maxDepth, maxEntries, got, visitedRef: () => visited, inc: () => ++visited, skip: () => ++skipped });
  const ranked = got.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, maxResults);
  const query = payload.query || payload.q || payload.find || payload.pattern || "";
  return {
    ok: true,
    action: payload.action || "pathHints",
    root: config.root,
    path: rootPath,
    absolutePath: root,
    query,
    tokens: toks,
    visitedEntries: visited,
    skippedEntries: skipped,
    returnedResults: ranked.length,
    results: ranked.map(x => ({ ...x, searchRequest: request(payload, query, x.path) })),
    recommendation: ranked.length ? "search_best_paths_first" : "fallback_to_root_bulkSearch",
    fallbackSearchRequest: request(payload, query, rootPath)
  };
}

async function walk(config, full, depth, state) {
  if (state.visitedRef() >= state.maxEntries || depth > state.maxDepth) return;
  let entries = [];
  try { entries = await fsp.readdir(full, { withFileTypes: true }); } catch { state.skip(); return; }
  for (const entry of entries) {
    if (state.visitedRef() >= state.maxEntries) return;
    const next = path.join(full, entry.name);
    const rel = relFrom(config, next);
    state.inc();
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name)) continue;
      state.got.push({ path: rel, kind: "dir", score: score(rel, "dir", state.toks) });
      await walk(config, next, depth + 1, state);
    } else if (entry.isFile()) await fileHit(config, next, rel, state);
  }
}

async function fileHit(config, full, rel, state) {
  try {
    assertNotSecret(config, full);
    state.got.push({ path: rel, kind: "file", score: score(rel, "file", state.toks) });
  } catch { state.skip(); }
}

function request(payload, query, p) {
  return { action: "bulkSearch", p, query, autoContinue: true, maxResults: payload.maxResults || 1000 };
}

module.exports = { pathHints, tokens, score };
