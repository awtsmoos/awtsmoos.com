// B"H
const path = require("path");
const fs = require("fs/promises");
const { safePath } = require("../pathGuard.js");
const { listDirDetailed } = require("../listing.js");
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
const { bulkSearch } = require("../pagedSearch.js");
const { pagedTree } = require("../pagedTree.js");

/**
 * B"H
 * Chapter 383: The many read doors learned one hallway.
 * Old actions still stand, but GET callers may now say action=read&mode=bulk,
 * action=search, or action=tree with cursor pagination and receive a clear
 * nextRequest when the scroll continues.
 */
function safeRegexText(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanMode(payload = {}, fallback = "text") {
  return String(payload.mode || payload.readMode || payload.kind || fallback).trim();
}

async function selectStringFile(config, payload) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const pattern = payload.pattern || payload.query || payload.find;
  if (!pattern) return { ok: false, action: "selectStringFile", error: "pattern_required" };
  const rx = new RegExp(safeRegexText(pattern), payload.caseSensitive ? "g" : "gi");
  const text = await fs.readFile(full, "utf8");
  const results = [];
  const maxResults = Number(payload.maxResults || 200);
  text.split(/\r?\n/).forEach((line, i) => {
    if (results.length < maxResults && rx.test(line)) results.push({ path: p, lineNumber: i + 1, line });
    rx.lastIndex = 0;
  });
  return { ok: true, action: "selectStringFile", pattern, count: results.length, results };
}

async function consolidatedRead(config, payload, base) {
  const mode = cleanMode(payload, "text");
  if (["bulk", "many", "files"].includes(mode)) return await readBulk(config, { ...payload, action: "bulk" });
  if (["connected", "connectedFiles"].includes(mode)) return await connectedFiles(config, { ...payload, action: "connectedFiles" });
  if (["lines", "readLines"].includes(mode)) return await readLines(config, payload);
  if (["manyLines", "readManyLines"].includes(mode)) return await readManyLines(config, payload);
  if (["base64", "read64"].includes(mode)) return { ...base, ...(await readBytesBase64(config, base.path, base.maxBytes, base.offsetBytes)) };
  if (["bytes", "readBytes"].includes(mode)) return { ...base, ...(await readTextFromBytes(config, base.path, base.maxBytes, base.offsetBytes)) };
  if (mode === "md") return await markdownRead(config, base);
  return { ...base, ...(await readText(config, base.path, base.maxChars, base.offsetChars)) };
}

async function markdownRead(config, base) {
  const got = await readText(config, base.path, base.maxChars, base.offsetChars);
  const lang = path.extname(base.path).replace(".", "");
  return { ...base, ...got, content: "```" + lang + "\n" + got.content + "\n```" };
}

async function consolidatedSearch(config, payload) {
  const mode = cleanMode(payload, payload.regex || payload.pattern ? "grep" : "bulkSearch");
  if (["find", "files", "findFiles"].includes(mode)) return await findFiles(config, { ...payload, action: "findFiles" });
  if (["select", "selectString"].includes(mode)) return await selectString(config, { ...payload, action: "selectString" });
  if (["file", "selectStringFile"].includes(mode)) return await selectStringFile(config, payload);
  if (["grep", "rg", "rgbgrep"].includes(mode)) return await grep(config, { ...payload, action: mode });
  return await bulkSearch(config, { ...payload, action: payload.action || "search" });
}

function baseRead(config, payload, action, p) {
  return {
    ok: true,
    action,
    root: config.root,
    path: p,
    absolutePath: safePath(config, p),
    maxChars: Number(payload.maxChars || 12000),
    offsetChars: Number(payload.offsetChars || 0),
    maxBytes: Number(payload.maxBytes || 24000),
    offsetBytes: Number(payload.offsetBytes || 0)
  };
}

function buildReadActions(ctx) {
  const { config, payload } = ctx;
  const action = payload.action || "list";
  const p = payload.path || payload.p || ".";
  const base = baseRead(config, payload, action, p);
  return {
    async stat() { return await statPath(config, payload); },
    async list() {
      const detailedItems = await listDirDetailed(config, p);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name), detailedItems };
    },
    async tree() { return await pagedTree(config, payload); },
    async read() { return await consolidatedRead(config, payload, base); },
    async search() { return await consolidatedSearch(config, payload); },
    async readLines() { return await readLines(config, payload); },
    async readManyLines() { return await readManyLines(config, payload); },
    async readBytes() { return { ...base, ...(await readTextFromBytes(config, p, base.maxBytes, base.offsetBytes)) }; },
    async read64() { return { ...base, ...(await readBytesBase64(config, p, base.maxBytes, base.offsetBytes)) }; },
    async md() { return await markdownRead(config, base); },
    async bulk() { return await readBulk(config, payload); },
    async grep() { return await grep(config, payload); },
    async rg() { return await grep(config, { ...payload, action: "rg" }); },
    async rgbgrep() { return await grep(config, { ...payload, action: "rgbgrep" }); },
    async find() { return await findFiles(config, payload); },
    async findFiles() { return await findFiles(config, payload); },
    async semanticSearch() { return await bulkSearch(config, { ...payload, action: "semanticSearch" }); },
    async bulkSearch() { return await bulkSearch(config, payload); },
    async bulkSearchPage() { return await bulkSearch(config, payload); },
    async selectString() { return await selectString(config, payload); },
    async selectStringFile() { return await selectStringFile(config, payload); },
    async fileHashes() { return await fileHashes(config, payload); },
    async astOutline() { return await astOutline(config, payload); },
    async symbolOutline() { return await symbolOutline(config, payload); },
    async connectedFiles() { return await connectedFiles(config, payload); }
  };
}

module.exports = { buildReadActions, safeRegexText, selectStringFile, consolidatedRead, consolidatedSearch };
