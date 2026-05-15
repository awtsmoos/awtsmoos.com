// B"H

"use strict";

const { call } = require("./callbacks.js");
const { openSftp } = require("./client.js");

/**
 * Opens SFTP for a task and returns the task result.
 *
 * @param {object} client - Authenticated SSH client.
 * @param {Function} task - Async function receiving SFTP.
 * @returns {Promise<*>} Task result.
 */
async function withSftp(client, task) {
  const sftp = await openSftp(client);
  return await task(sftp);
}

/**
 * Lists a remote directory.
 *
 * @param {object} sftp - Ready SFTP client.
 * @param {string} folderPath - Remote directory path.
 * @returns {Promise<object[]>} Directory entries.
 */
async function listFolder(sftp, folderPath) {
  const entries = await call((cb) => sftp.readdir(folderPath || ".", cb));
  return entries.map((entry) => ({
    name: entry.filename,
    longname: entry.longname,
    kind: kindOf(entry.attrs),
    attrs: entry.attrs,
  }));
}

/**
 * Detects a directory entry kind from SFTP attrs.
 *
 * @param {object} attrs - SFTP attrs object.
 * @returns {string} file, directory, symlink, or unknown.
 */
function kindOf(attrs = {}) {
  if (attrs.isDirectory && attrs.isDirectory()) return "directory";
  if (attrs.isFile && attrs.isFile()) return "file";
  if (attrs.isSymbolicLink && attrs.isSymbolicLink()) return "symlink";

  const type = (attrs.mode || 0) & 0o170000;
  if (type === 0o040000) return "directory";
  if (type === 0o100000) return "file";
  if (type === 0o120000) return "symlink";
  return "unknown";
}

/**
 * Reads a complete remote file as UTF-8.
 *
 * @param {object} sftp - Ready SFTP client.
 * @param {string} filePath - Remote file path.
 * @returns {Promise<string>} File contents.
 */
async function readFile(sftp, filePath) {
  const stats = await call((cb) => sftp.stat(filePath, cb));
  const size = Number(stats.size || 0);
  const handle = await call((cb) => sftp.open(filePath, "r", cb));
  try {
    const buffer = Buffer.alloc(size);
    if (size > 0) {
      await call((cb) => sftp.read(handle, buffer, 0, size, 0, cb));
    }
    return buffer.toString("utf8");
  } finally {
    await call((cb) => sftp.close(handle, cb)).catch(() => {});
  }
}

/**
 * Writes a complete remote file as UTF-8.
 *
 * @param {object} sftp - Ready SFTP client.
 * @param {string} filePath - Remote file path.
 * @param {string|Buffer} content - File contents.
 * @returns {Promise<object>} Write details.
 */
async function writeFile(sftp, filePath, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(String(content || ""), "utf8");
  const handle = await call((cb) => sftp.open(filePath, "w+", cb));
  try {
    await call((cb) => sftp.write(handle, data, 0, data.length, 0, cb));
    return { bytes: data.length };
  } finally {
    await call((cb) => sftp.close(handle, cb)).catch(() => {});
  }
}

module.exports = {
  withSftp,
  listFolder,
  readFile,
  writeFile,
};
