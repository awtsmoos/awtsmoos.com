// B"H
const fs = require("fs");
const path = require("path");
const { geelooyRoot } = require("./sourceFile.js");

const DEFAULT_GEELOOY_ROOT = geelooyRoot();
const AGENT_ROOT = path.join(DEFAULT_GEELOOY_ROOT, "apps", "tunnel", "agent");
const encoder = new TextEncoder();

/**
 * B"H
 * Chapter 629: The ZIP learned not to lie by omission.
 * Manifest paths now resolve through their true roots, and missing vessels
 * explode before publication instead of disappearing inside the bundle.
 *
 * @returns {Buffer} ZIP archive containing every manifest file.
 */
function buildAgentZip(repoRoot) {
  const roots = resolveRoots(repoRoot);
  const missing = [];
  const entries = manifestFiles(roots).flatMap(filePath => {
    const sourcePath = sourcePathFor(filePath, roots);
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      missing.push(filePath);
      return [];
    }
    const stat = fs.statSync(sourcePath);
    if (!stat.isFile()) {
      missing.push(filePath);
      return [];
    }
    return [{ path: slash(filePath), data: fs.readFileSync(sourcePath), date: new Date(2026, 0, 1) }];
  });
  if (missing.length) {
    const err = new Error(`agent_zip_manifest_missing: ${missing.slice(0, 30).join(", ")}`);
    err.code = "AGENT_ZIP_MANIFEST_MISSING";
    err.missing = missing;
    throw err;
  }
  return buildZip(entries);
}

/**
 * B"H
 * Reads the manifest as a complete ordered list of files.
 *
 * @returns {string[]} Entry file followed by manifest files.
 */
function manifestFiles(roots = resolveRoots()) {
  if (typeof roots === "string") roots = resolveRoots(roots);
  const lines = fs.readFileSync(path.join(roots.agentRoot, "manifest.txt"), "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line !== 'B"H' && line !== '# B"H');
  return [lines[1], ...lines.slice(2)].filter(isSafeManifestPath);
}

/**
 * B"H
 * Maps manifest paths to their true source roots.
 *
 * @param {string} filePath Manifest-relative path.
 * @returns {string|null} Absolute source file path.
 */
function sourcePathFor(filePath, roots = resolveRoots()) {
  if (!isSafeManifestPath(filePath)) return null;
  const root = rootFor(filePath, roots);
  const full = path.resolve(root, filePath);
  return isInside(root, full) ? full : null;
}

function rootFor(filePath, roots) {
  if (filePath.startsWith("ai/")) return roots.geelooyRoot;
  if (filePath.startsWith("ayzarim/")) return roots.repoRoot;
  return roots.agentRoot;
}

function resolveRoots(repoRoot) {
  const repo = repoRoot ? path.resolve(repoRoot) : path.resolve(DEFAULT_GEELOOY_ROOT, "..");
  const geelooy = path.join(repo, "geelooy");
  return { repoRoot: repo, geelooyRoot: geelooy, agentRoot: path.join(geelooy, "apps", "tunnel", "agent") };
}

function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function isInside(root, full) {
  const relative = path.relative(path.resolve(root), path.resolve(full));
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}
function isSafeManifestPath(filePath) {
  const normalized = slash(filePath).trim();
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) return false;
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length || segments.join("/") !== normalized) return false;
  return !segments.some(segment => segment === "." || segment === ".." || segment === ".DS_Store" || segment === "__MACOSX" || segment === "node_modules" || segment === ".git" || segment.startsWith("._"));
}

/**
 * B"H
 * Builds an uncompressed ZIP buffer with local headers, central directory,
 * and the closing seal.
 */
function buildZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.path.replace(/\\/g, "/"));
    const data = Buffer.from(entry.data);
    const stamp = dosStamp(entry.date);
    const crc = crc32(data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(stamp.time, 10);
    local.writeUInt16LE(stamp.date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    Buffer.from(name).copy(local, 30);
    parts.push(local, data);
    central.push({ name, crc, size: data.length, offset, stamp });
    offset += local.length + data.length;
  }
  const centralStart = offset;
  let centralSize = 0;
  for (const item of central) {
    const header = Buffer.alloc(46 + item.name.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(item.stamp.time, 12);
    header.writeUInt16LE(item.stamp.date, 14);
    header.writeUInt32LE(item.crc, 16);
    header.writeUInt32LE(item.size, 20);
    header.writeUInt32LE(item.size, 24);
    header.writeUInt16LE(item.name.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0x20, 38);
    header.writeUInt32LE(item.offset, 42);
    Buffer.from(item.name).copy(header, 46);
    parts.push(header);
    centralSize += header.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  parts.push(end);
  return Buffer.concat(parts);
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function dosStamp(date) {
  const year = Math.max(1980, date.getFullYear());
  return { date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(), time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1) };
}

module.exports = { buildAgentZip, manifestFiles, isSafeManifestPath, sourcePathFor, resolveRoots };
