// B"H
const crypto = require("crypto");
const { makeZip } = require("./zipWriter.js");
const { LIMITS } = require("./bundleLimits.js");
const { parseManifest, partitionFiles } = require("./bundleManifest.js");
const { sourceFileFor } = require("./sourceResolver.js");

/**
 * B"H
 * Builds one partition ZIP from the checked-in agent manifest. The manifest is
 * still the source of truth; ZIPs are only a faster garment over the same files.
 */
async function buildBundleZip({ fs, agentRoot, part }) {
  const manifestText = await fs.readFile(require("path").join(agentRoot, "manifest.txt"), "utf8");
  const parsed = parseManifest(manifestText);
  const all = [...new Set([parsed.entry, ...parsed.files])];
  const files = (partitionFiles(all)[part] || []).filter(Boolean);
  if (!files.length) throw new Error("Unknown or empty bundle part: " + part);
  if (files.length > LIMITS.maxFiles) throw new Error("Bundle file count limit exceeded.");
  const entries = [];
  let sourceBytes = 0;
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const full = sourceFileFor(agentRoot, file);
    if (!full) continue;
    const buf = await fs.readFile(full);
    sourceBytes += buf.length;
    if (sourceBytes > LIMITS.maxSourceBytes) throw new Error("Bundle source byte limit exceeded.");
    hash.update(file).update("\0").update(buf);
    entries.push({ name: file, content: buf });
  }
  const zip = makeZip(entries);
  if (zip.length > LIMITS.maxZipBytes) throw new Error("Bundle ZIP byte limit exceeded.");
  return { zip, files: entries.length, sourceBytes, zipBytes: zip.length, sha256: hash.digest("hex") };
}

module.exports = { buildBundleZip };
