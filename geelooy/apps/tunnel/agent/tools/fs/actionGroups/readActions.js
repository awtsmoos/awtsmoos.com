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
const { pathHints } = require("../pathHints.js");

/**
 * B"H
 * Chapter 473: The read hallway gained a lantern before the search door.
 * Agents may now ask pathHints/searchPathHints to reveal likely roots and ready
 * bulkSearch requests before burning time in the wrong forest.
 */
function safeRegexText(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanMode(payload = {}, fallback = "text") {
  return String(payload.mode || payload.readMode || payload.kind || fallback).trim();
}

async function selectStringFile(config, payload) {
  const p = pathFromCwd(config, payload, payload.path || payload.p || ".");
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
  if (["paths", "pathHints", "searchPathHints"].includes(mode)) return await pathHints(config, { ...payload, action: "pathHints" });
  if (["find", "files", "findFiles"].includes(mode)) return await findFiles(config, { ...payload, action: "findFiles" });
  if (["select", "selectString"].includes(mode)) return await selectString(config, { ...payload, action: "selectString" });
  if (["file", "selectStringFile"].includes(mode)) return await selectStringFile(config, payload);
  if (["grep", "rg", "rgbgrep"].includes(mode)) return await grep(config, { ...payload, action: mode });
  return await bulkSearch(config, { ...payload, action: payload.action || "search" });
}

function pathFromCwd(config, payload, p) {
  const given = p || ".";
  if (path.isAbsolute(given)) return given;
  const cwd = payload.cwd || payload.basePath || payload.base || "";
  if (!cwd) return given;
  const root = path.resolve(config.root);
  const base = path.isAbsolute(cwd) ? path.resolve(cwd) : path.resolve(root, cwd);
  const full = path.resolve(base, given);
  if (!full.toLowerCase().startsWith(root.toLowerCase())) throw new Error("Path outside allowed project root: " + full);
  return path.relative(root, full).replace(/\\/g, "/") || ".";
}

function baseRead(config, payload, action, p) {
  const resolvedPath = p || ".";
  return { ok: true, action, root: config.root, path: resolvedPath, absolutePath: safePath(config, resolvedPath),
    maxChars: Number(payload.maxChars || 12000), offsetChars: Number(payload.offsetChars || 0),
    maxBytes: Number(payload.maxBytes || 24000), offsetBytes: Number(payload.offsetBytes || 0) };
}

function buildReadActions(ctx) {
  const { config } = ctx;
  const incomingPayload = ctx.payload || {};
  const action = incomingPayload.action || "list";
  const p = pathFromCwd(config, incomingPayload, incomingPayload.path || incomingPayload.p || ".");
  const payload = { ...incomingPayload, path: p, p };
  const base = baseRead(config, payload, action, p);
  return readActions(config, payload, action, p, base);
}

function readActions(config, payload, action, p, base) {
  return {
    stat: () => statPath(config, payload),
    list: async () => listResult(config, action, p),
    tree: () => pagedTree(config, payload), read: () => consolidatedRead(config, payload, base),
    search: () => consolidatedSearch(config, payload), readLines: () => readLines(config, payload),
    readManyLines: () => readManyLines(config, payload), readBytes: () => readTextFromBytes(config, p, base.maxBytes, base.offsetBytes).then(x => ({ ...base, ...x })),
    read64: () => readBytesBase64(config, p, base.maxBytes, base.offsetBytes).then(x => ({ ...base, ...x })),
    md: () => markdownRead(config, base), bulk: () => readBulk(config, payload), grep: () => grep(config, payload),
    rg: () => grep(config, { ...payload, action: "rg" }), rgbgrep: () => grep(config, { ...payload, action: "rgbgrep" }),
    find: () => findFiles(config, payload), findFiles: () => findFiles(config, payload),
    semanticSearch: () => bulkSearch(config, { ...payload, action: "semanticSearch" }), bulkSearch: () => bulkSearch(config, payload),
    bulkSearchPage: () => bulkSearch(config, payload), selectString: () => selectString(config, payload), selectStringFile: () => selectStringFile(config, payload),
    pathHints: () => pathHints(config, payload), searchPathHints: () => pathHints(config, { ...payload, action: "searchPathHints" }),
    fileHashes: () => fileHashes(config, payload), astOutline: () => astOutline(config, payload),
    symbolOutline: () => symbolOutline(config, payload), connectedFiles: () => connectedFiles(config, payload)
  };
}

async function listResult(config, action, p) {
  const detailedItems = await listDirDetailed(config, p);
  return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p),
    items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name), detailedItems };
}

module.exports = { buildReadActions, safeRegexText, selectStringFile, consolidatedRead, consolidatedSearch };
