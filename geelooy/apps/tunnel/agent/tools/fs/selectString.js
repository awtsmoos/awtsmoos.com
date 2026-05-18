// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

function rx(patterns, caseSensitive) {
  const list = Array.isArray(patterns) ? patterns : String(patterns || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!list.length) throw new Error("pattern or patterns is required.");
  return new RegExp(list.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), caseSensitive ? "g" : "gi");
}

async function walk(dir, out, limit) {
  if (out.length >= limit) return;
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    if (out.length >= limit) return;
    if (["node_modules", ".git", ".awtsmoos-repo"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out, limit);
    else out.push(full);
  }
}

async function selectString(config, payload) {
  const root = safePath(config, payload.path || payload.p || ".");
  const files = [];
  const maxFiles = Number(payload.maxFiles || 2000);
  const maxResults = Number(payload.maxResults || 200);
  const matcher = rx(payload.patterns || payload.pattern || payload.query || payload.find, !!payload.caseSensitive);

  await walk(root, files, maxFiles);

  const results = [];
  for (const file of files) {
    if (results.length >= maxResults) break;
    let text = "";
    try { text = await fs.readFile(file, "utf8"); } catch (_) { continue; }
    text.split(/\r?\n/).forEach((line, i) => {
      if (results.length < maxResults && matcher.test(line)) {
        results.push({ path: path.relative(config.root, file).replace(/\\/g, "/"), lineNumber: i + 1, line });
      }
      matcher.lastIndex = 0;
    });
  }
  return { ok: true, action: "selectString", pattern: payload.pattern || payload.query || payload.find, count: results.length, results };
}

module.exports = { selectString };
