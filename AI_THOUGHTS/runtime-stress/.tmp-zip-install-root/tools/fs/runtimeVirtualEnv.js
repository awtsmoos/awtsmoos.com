// B"H
/**
 * @file runtimeVirtualEnv.js
 * @description
 * Chapter 10: The old monolith shattered into smaller vessels. The Awtsmoos
 * now gathers runtime files through named helpers, skips non-code scripts during
 * preflight, and gives inline HTML a real page-name before Merkava awakens it.
 */

const path = require("path");
const { inlineRuntimeFiles, parseObject } = require("./runtime/inlineFiles.js");
const { discoverEntry } = require("./runtime/discovery.js");
const { collectReachableFiles } = require("./runtime/collector.js");
const { withPreflight } = require("./runtime/preflight.js");
const { refsFrom } = require("./runtime/sourceRefs.js");
const { slash } = require("./runtime/pathUtils.js");

/**
 * Builds the virtual browser file map used by Merkava runtime simulation.
 * @param {object} payload Tunnel action payload containing path, html, files, or code.
 * @param {object} config Agent configuration containing the guarded root.
 * @returns {object} Runtime environment with entry, files, diagnostics, and ok flag.
 */
function buildRuntimeVirtualEnv(payload = {}, config = {}) {
  const root = path.resolve(config.root || process.cwd());
  const entryRaw = payload.entry || payload.path || payload.p || payload.target || "index.html";
  const inline = inlineRuntimeFiles(payload, entryRaw);
  if (inline) return withPreflight({ entry: inline.entry, files: inline.files, source: "inline" });

  const explicit = parseObject(payload.files || payload.files64, null);
  if (explicit) return withPreflight({ entry: slash(entryRaw), files: explicit, source: "explicit" });

  if (String(payload.files || "") === "[object Object]") {
    return withPreflight({ entry: slash(entryRaw), files: {}, source: "coerced-files", error: "files_object_coerced" });
  }

  const discovered = discoverEntry(root, entryRaw);
  if (!discovered.ok) {
    return withPreflight({ entry: slash(entryRaw), files: {}, source: "missing", error: discovered.error, diagnostics: discovered.diagnostics || [] });
  }

  const files = collectReachableFiles(root, discovered.entryAbs);
  return withPreflight({ entry: slash(path.relative(root, discovered.entryAbs)), files, source: discovered.source, diagnostics: discovered.diagnostics || [] });
}

module.exports = { buildRuntimeVirtualEnv, refsFrom, discoverEntry };
