// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");
const { symbols } = require("./symbolOutline.js");

const IMPORT_RE = /(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
const EXTENSIONS = ["", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", "/index.js"];

async function exists(p) {
  try { const st = await fs.stat(p); return st.isFile() ? p : null; } catch (_) { return null; }
}

async function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const ext of EXTENSIONS) {
    const got = await exists(base + ext);
    if (got) return got;
  }
  return null;
}

async function connectedFiles(config, payload) {
  const entry = safePath(config, payload.path || payload.p || ".");
  const maxDepth = Number(payload.depth || payload.maxDepth || 4);
  const maxFiles = Number(payload.maxFiles || 80);
  const mode = payload.mode || "full";
  const seen = new Set();
  const files = [];

  async function visit(file, depth) {
    if (seen.has(file) || files.length >= maxFiles || depth > maxDepth) return;
    seen.add(file);
    let text = "";
    try { text = await fs.readFile(file, "utf8"); } catch (_) { return; }
    const rel = path.relative(config.root, file).replace(/\\/g, "/");
    files.push({ path: rel, depth, bytes: Buffer.byteLength(text), symbols: mode === "outline" ? symbols(text) : undefined, content: mode === "full" ? text : undefined });

    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(text))) {
      const next = await resolveImport(file, m[1]);
      if (next) await visit(next, depth + 1);
    }
  }

  await visit(entry, 0);
  return { ok: true, action: "connectedFiles", entry: path.relative(config.root, entry).replace(/\\/g, "/"), mode, count: files.length, files };
}

module.exports = { connectedFiles };
