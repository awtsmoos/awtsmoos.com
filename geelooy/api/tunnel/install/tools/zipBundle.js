// B"H
const fs = require("fs");
const path = require("path");
const { geelooyRoot } = require("./sourceFile.js");

const AGENT_ROOT = path.join(geelooyRoot(), "apps", "tunnel", "agent");
const encoder = new TextEncoder();

/**
 * B"H
 * Chapter 612: The installer asked for one bundle, not a thousand crumbs.
 * This forge writes a plain ZIP from the manifest itself, so the bootstrap
 * receives one whole vessel and either rises complete or fails clean.
 *
 * @returns {Buffer} ZIP archive containing the tunnel agent manifest.
 */
function buildAgentZip() {
  const entries = manifestFiles().map(filePath => ({
    path: filePath,
    data: fs.readFileSync(sourcePathFor(filePath)),
    date: new Date(2026, 0, 1)
  }));
  return buildZip(entries);
}

/**
 * B"H
 * Reads the manifest as a complete ordered list of files.
 *
 * @returns {string[]} Entry file followed by manifest files.
 */
function manifestFiles() {
  const lines = fs.readFileSync(path.join(AGENT_ROOT, "manifest.txt"), "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line !== 'B"H' && line !== '# B"H');
  return [lines[1], ...lines.slice(2)];
}

/**
 * B"H
 * Maps manifest paths to their true source roots.
 *
 * @param {string} filePath Manifest-relative path.
 * @returns {string} Absolute source file path.
 */
function sourcePathFor(filePath) {
  return filePath.startsWith("ai/")
    ? path.join(geelooyRoot(), filePath)
    : path.join(AGENT_ROOT, filePath);
}

/**
 * B"H
 * Builds an uncompressed ZIP buffer with local headers, central directory,
 * and the closing seal.
 *
 * @param {{path:string,data:Buffer,date:Date}[]} entries Files to include.
 * @returns {Buffer} ZIP bytes.
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

/**
 * B"H
 * Seals each file with CRC, the little signature that tells the unzipper the
 * body arrived exactly as spoken.
 *
 * @param {Buffer} data File bytes.
 * @returns {number} Unsigned CRC32.
 */
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * B"H
 * Converts a date into the old DOS timestamp language ZIP still understands.
 *
 * @param {Date} date JavaScript date.
 * @returns {{date:number,time:number}} ZIP timestamp fields.
 */
function dosStamp(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  };
}

module.exports = { buildAgentZip, manifestFiles };
