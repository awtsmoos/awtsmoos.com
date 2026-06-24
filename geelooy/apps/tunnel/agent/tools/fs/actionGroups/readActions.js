// B"H
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { listDirDetailed } = require("../listing.js");
const { treeText } = require("../tree.js");
const { readText, readBytesBase64, readTextFromBytes } = require("../readWrite.js");
const { readBulk } = require("../bulkRead.js");
const { statPath, readLines, grep } = require("../searchEdit.js");
const { readManyLines } = require("../lineBatch.js");
const { findFiles } = require("../findFiles.js");
const { fileHashes } = require("../hashWrite.js");
const { selectString } = require("../selectString.js");
const { symbolOutline } = require("../symbolOutline.js");
const { connectedFiles } = require("../connectedFiles.js");
const { astOutline } = require("../astOutline.js");

function relativeFromCwd(config, payload, filePath) {
  const given = filePath || ".";
  if (path.isAbsolute(given)) return path.relative(path.resolve(config.root), path.resolve(given)).replace(/\\/g, "/") || ".";

  const cwd = payload.cwd || payload.basePath || payload.base || "";
  if (!cwd || cwd === ".") return given;

  const root = path.resolve(config.root);
  const base = path.isAbsolute(cwd) ? path.resolve(cwd) : path.resolve(root, cwd);
  const full = path.resolve(base, given);

  if (!full.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Path outside allowed project root: " + full);
  }

  return path.relative(root, full).replace(/\\/g, "/") || ".";
}

function withResolvedPath(config, payload) {
  const p = relativeFromCwd(config, payload, payload.path || payload.p || ".");
  return { ...payload, path: p, p };
}

function base(config, action, p) {
  return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p) };
}

function buildReadActions(ctx) {
  const { config } = ctx;
  const payload = withResolvedPath(config, ctx.payload || {});
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const maxBytes = Number(payload.maxBytes || 24000);
  const offsetBytes = Number(payload.offsetBytes || 0);

  return {
    async stat() { return statPath(config, payload); },
    async list() {
      const detailedItems = await listDirDetailed(config, p);
      return { ...base(config, action, p), items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name), detailedItems };
    },
    async tree() {
      return { ...base(config, action, p), treeText: await treeText(config, p, payload.depth, payload.limit) };
    },
    async read() {
      return { ...base(config, action, p), ...(await readText(config, p, maxChars, offsetChars)) };
    },
    async readLines() { return readLines(config, payload); },
    async readManyLines() { return readManyLines(config, payload); },
    async readBytes() {
      return { ...base(config, action, p), ...(await readTextFromBytes(config, p, maxBytes, offsetBytes)) };
    },
    async read64() {
      return { ...base(config, action, p), ...(await readBytesBase64(config, p, maxBytes, offsetBytes)) };
    },
    async md() {
      const got = await readText(config, p, maxChars, offsetChars);
      const lang = path.extname(p).replace(".", "");
      return { ...base(config, action, p), content: "```" + lang + "\n" + got.content + "\n```", ...got };
    },
    async bulk() { return readBulk(config, payload); },
    async grep() { return grep(config, payload); },
    async selectString() { return selectString(config, payload); },
    async findFiles() { return findFiles(config, payload); },
    async fileHashes() { return fileHashes(config, payload); },
    async astOutline() { return astOutline(config, payload); },
    async symbolOutline() { return symbolOutline(config, payload); },
    async connectedFiles() { return connectedFiles(config, payload); }
  };
}

module.exports = { buildReadActions };