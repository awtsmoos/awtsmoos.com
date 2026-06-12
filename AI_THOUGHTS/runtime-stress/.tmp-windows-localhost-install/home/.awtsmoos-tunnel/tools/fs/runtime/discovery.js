// B"H
/**
 * @file discovery.js
 * @description
 * Chapter 8: The Awtsmoos entered a folder and asked, “Where is your first
 * breath?” The directory answered with index, app, main, or the first honest page.
 */

const fs = require("fs");
const path = require("path");
const { ENTRY_CANDIDATES } = require("./constants.js");
const { slash, safeJoin } = require("./pathUtils.js");

function discoverEntry(root, entryRaw) {
  const abs = safeJoin(root, entryRaw || ".");
  if (!abs || !fs.existsSync(abs)) return { ok: false, error: "entry_not_found" };
  const stat = fs.statSync(abs);
  if (stat.isFile()) return { ok: true, entryAbs: abs, source: "path" };
  if (!stat.isDirectory()) return { ok: false, error: "entry_not_file_or_directory" };
  return discoverDirectoryEntry(root, abs);
}

function discoverDirectoryEntry(root, abs) {
  const candidates = [...ENTRY_CANDIDATES, ...htmlFiles(abs), ...jsFiles(abs)];
  const seen = new Set();
  for (const name of candidates) {
    const clean = slash(name);
    if (seen.has(clean)) continue;
    seen.add(clean);
    const next = path.join(abs, clean);
    if (fs.existsSync(next) && fs.statSync(next).isFile()) {
      return { ok: true, entryAbs: next, source: "directory", diagnostics: [{ kind: "directory-entry", entry: slash(path.relative(root, next)) }] };
    }
  }
  return { ok: false, error: "directory_entry_not_found", diagnostics: [{ kind: "searched", candidates }] };
}

function htmlFiles(dir) {
  return safeReadDir(dir).filter(x => /\.html?$/i.test(x)).sort();
}

function jsFiles(dir) {
  return safeReadDir(dir).filter(x => /\.m?js$/i.test(x)).sort();
}

function safeReadDir(dir) {
  try { return fs.readdirSync(dir); } catch (_) { return []; }
}

module.exports = { discoverEntry };
