// B"H
const fsp = require("fs/promises");
const path = require("path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const { safePath, rel } = require("./pathGuard.js");

async function treeText(config, p, depth, limit, state = { count: 0 }, prefix = "") {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");

  depth = Math.min(Number(depth || 2), 4);
  limit = Math.min(Number(limit || 150), 600);

  const full = safePath(config, p);
  const stat = await fsp.stat(full);
  const name = path.basename(full) || rel(config, full);

  if (state.count++ >= limit) return prefix + "...limit reached";
  if (!stat.isDirectory()) return prefix + name;

  let out = prefix + name + "/";
  if (depth <= 0) return out;

  const entries = await fsp.readdir(full, { withFileTypes: true });

  for (const e of entries.slice(0, 120)) {
    if (SKIP.has(e.name)) continue;
    if (!config.allowSecrets && SECRET_FILES.has(e.name)) continue;
    const childRel = path.join(rel(config, full), e.name);
    out += "\n" + await treeText(config, childRel, depth - 1, limit, state, prefix + "  ");
  }

  return out;
}

module.exports = { treeText };