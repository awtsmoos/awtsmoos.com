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

function buildReadActions(ctx) {
  const { config, payload } = ctx;
  const action = payload.action || "list";
  const p = payload.path || payload.p || ".";
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const maxBytes = Number(payload.maxBytes || 24000);
  const offsetBytes = Number(payload.offsetBytes || 0);

  return {
    async stat() { return await statPath(config, payload); },
    async list() {
      const detailedItems = await listDirDetailed(config, p);
      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name),
        detailedItems
      };
    },
    async tree() {
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), treeText: await treeText(config, p, payload.depth, payload.limit) };
    },
    async read() {
      const got = await readText(config, p, maxChars, offsetChars);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async readLines() { return await readLines(config, payload); },
    async readManyLines() { return await readManyLines(config, payload); },
    async readBytes() {
      const got = await readTextFromBytes(config, p, maxBytes, offsetBytes);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async read64() {
      const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async md() {
      const got = await readText(config, p, maxChars, offsetChars);
      const lang = path.extname(p).replace(".", "");
      return { ok: true, action, root: config.root, path: p, content: "```" + lang + "\n" + got.content + "\n```", ...got };
    },
    async bulk() { return await readBulk(config, payload); },
    async grep() { return await grep(config, payload); },
    async selectString() { return await selectString(config, payload); },
    async findFiles() { return await findFiles(config, payload); },
    async fileHashes() { return await fileHashes(config, payload); },
    async astOutline() { return await astOutline(config, payload); },
    async symbolOutline() { return await symbolOutline(config, payload); },
    async connectedFiles() { return await connectedFiles(config, payload); }
  };
}

module.exports = { buildReadActions };
