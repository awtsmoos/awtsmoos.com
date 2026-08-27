// B"H
const posix = require("path").posix;
const { cleanPath } = require("./path.js");
const { readWhole } = require("./listRead.js");

const IMPORT_RE = /\b(?:require\(["']([^'"]+)['"]\)|import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|export\s+[^'"]+\s+from\s+['"]([^'"]+)['"])/g;
const EXTS = ["", ".js", ".mjs", ".cjs", ".json", "/index.js"];

function specOf(match) {
  return match[1] || match[2] || match[3] || null;
}

function resolveLocal(fromPath, spec) {
  if (!spec || !spec.startsWith(".")) return null;
  const base = posix.normalize(posix.join(posix.dirname(fromPath), spec));
  return EXTS.map(ext => cleanPath(base + ext));
}

function importsFrom(text) {
  const out = [];
  IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = IMPORT_RE.exec(text))) out.push({ spec: specOf(m), index: m.index });
  return out;
}

async function tryRead($i, userId, path) {
  try { return await readWhole($i, userId, path); }
  catch (e) { return null; }
}

async function firstReadable($i, userId, candidates) {
  for (const p of candidates || []) {
    const got = await tryRead($i, userId, p);
    if (got) return { path: p, got };
  }
  return null;
}

/**
 * B"H
 * Builds a bounded import graph inside the hosted Awtsmoos OS, verifying each local edge by read.
 */
async function dependencyGraph($i, userId, payload) {
  const entry = cleanPath(payload.path || payload.p || ".");
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 80), 200));
  const maxDepth = Math.max(0, Math.min(Number(payload.depth || 4), 12));
  const seen = new Set();
  const nodes = [];
  const edges = [];

  async function visit(path, depth) {
    if (seen.has(path) || seen.size >= maxFiles || depth > maxDepth) return;
    seen.add(path);
    const got = await tryRead($i, userId, path);
    nodes.push({ path, depth, ok: !!got });
    if (!got) return;

    for (const imp of importsFrom(got.content)) {
      const candidates = resolveLocal(path, imp.spec);
      const resolved = await firstReadable($i, userId, candidates);
      edges.push({ from: path, spec: imp.spec, to: resolved?.path || null });
      if (resolved) await visit(resolved.path, depth + 1);
    }
  }

  await visit(entry, 0);
  return { ok: true, action: "dependencyGraph", entry, nodes, edges, partial: seen.size >= maxFiles };
}

async function connectedFiles($i, userId, payload) {
  const graph = await dependencyGraph($i, userId, payload);
  return { ...graph, action: "connectedFiles", count: graph.nodes.length, files: graph.nodes };
}

module.exports = { dependencyGraph, connectedFiles };
