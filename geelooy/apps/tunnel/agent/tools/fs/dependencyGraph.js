// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const RE = /\b(?:require\(["']([^"']+)["']\)|import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["'])/g;

/**
 * B"H
 * Resolves a local JavaScript import to a file when possible.
 *
 * @param {string} fromFile Absolute source file.
 * @param {string} spec Import specifier.
 * @returns {Promise<string|null>} Absolute target or null.
 */
async function resolveLocal(fromFile, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;

  const base = spec.startsWith("/") ? spec : path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    base + ".js",
    base + ".mjs",
    base + ".cjs",
    path.join(base, "index.js")
  ];

  for (const c of candidates) {
    try {
      const st = await fsp.stat(c);
      if (st.isFile()) return c;
    } catch (_e) {}
  }

  return null;
}

/**
 * B"H
 * Traces local JS require/import edges from an entry file.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Graph result.
 */
async function dependencyGraph(config, payload = {}) {
  const entryRel = payload.path || payload.p;
  if (!entryRel) return { ok: false, action: "dependencyGraph", error: "missing_path" };

  const entry = safePath(config, entryRel);
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 80), 300));
  const maxDepth = Math.max(0, Math.min(Number(payload.depth || 6), 20));
  const seen = new Set();
  const nodes = [];
  const edges = [];

  async function visit(file, depth) {
    if (seen.has(file) || seen.size >= maxFiles || depth > maxDepth) return;
    seen.add(file);
    assertNotSecret(config, file);

    const rel = path.relative(config.root, file).replace(/\\/g, "/");
    nodes.push({ path: rel, depth });

    let text = "";
    try { text = await fsp.readFile(file, "utf8"); }
    catch (e) { nodes[nodes.length - 1].error = e.message; return; }

    RE.lastIndex = 0;
    let match;
    while ((match = RE.exec(text))) {
      const spec = match[1] || match[2];
      const target = await resolveLocal(file, spec);
      edges.push({ from: rel, spec, to: target ? path.relative(config.root, target).replace(/\\/g, "/") : null });
      if (target) await visit(target, depth + 1);
    }
  }

  await visit(entry, 0);

  return {
    ok: true,
    action: "dependencyGraph",
    entry: entryRel,
    nodes,
    edges,
    partial: seen.size >= maxFiles
  };
}

module.exports = { dependencyGraph };
