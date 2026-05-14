// B"H
const fsp = require("fs/promises");
const path = require("path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const { safePath, rel } = require("./pathGuard.js");

function itemKind(entry) {
  if (entry.isDirectory()) return "directory";
  if (entry.isFile()) return "file";
  if (entry.isSymbolicLink()) return "link";
  return "other";
}

async function listDirDetailed(config, p) {
  if (!config.tools.fsList) throw new Error("fsList disabled.");

  const full = safePath(config, p);
  const entries = await fsp.readdir(full, { withFileTypes: true });

  const items = entries
    .filter(e => !SKIP.has(e.name))
    .filter(e => config.allowSecrets || !SECRET_FILES.has(e.name))
    .slice(0, 300)
    .map(e => {
      const child = path.join(full, e.name);
      return {
        name: e.name,
        type: itemKind(e),
        path: rel(config, child),
        absolutePath: child,
        isDirectory: e.isDirectory()
      };
    });

  items.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

module.exports = {
  listDirDetailed
};