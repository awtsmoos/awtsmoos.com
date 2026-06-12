// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const { HOME } = require("../../lib/config.js");

function driveRoots() {
  if (process.platform !== "win32") return ["/", HOME];

  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    .map(letter => letter + ":\\")
    .filter(root => {
      try {
        fs.accessSync(root);
        return true;
      } catch (e) {
        return false;
      }
    });
}

function normalizeAbsolute(input) {
  if (!input || input === "__ROOTS__") return "__ROOTS__";
  return path.resolve(input);
}

function parentOf(input) {
  const normalized = normalizeAbsolute(input);

  if (normalized === "__ROOTS__") return "__ROOTS__";

  const parent = path.dirname(normalized);
  if (parent === normalized) return "__ROOTS__";
  return parent;
}

function kindOf(entry) {
  if (entry.isDirectory()) return "directory";
  if (entry.isFile()) return "file";
  if (entry.isSymbolicLink()) return "link";
  return "other";
}

/**
 * B"H
 * Root browser intentionally lists absolute directories before a root has been
 * selected. It only exposes names/types and only uses this for choosing a root,
 * not reading file contents.
 */
async function rootBrowse(payload = {}) {
  const requested = payload.absolutePath || payload.root || payload.path || "__ROOTS__";
  const current = normalizeAbsolute(requested);

  if (current === "__ROOTS__") {
    const roots = driveRoots();

    return {
      ok: true,
      action: "rootBrowse",
      current: "__ROOTS__",
      parent: "__ROOTS__",
      roots,
      items: roots.map(root => ({
        name: root,
        type: "directory",
        path: root,
        absolutePath: root,
        isDirectory: true
      }))
    };
  }

  let entries = [];

  try {
    entries = await fsp.readdir(current, { withFileTypes: true });
  } catch (e) {
    return {
      ok: false,
      action: "rootBrowse",
      current,
      parent: parentOf(current),
      error: e.message
    };
  }

  const items = entries
    .filter(e => e.isDirectory())
    .slice(0, 500)
    .map(e => {
      const absolutePath = path.join(current, e.name);

      return {
        name: e.name,
        type: kindOf(e),
        path: absolutePath,
        absolutePath,
        isDirectory: e.isDirectory()
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    ok: true,
    action: "rootBrowse",
    current,
    parent: parentOf(current),
    roots: driveRoots(),
    items
  };
}

module.exports = {
  driveRoots,
  rootBrowse
};