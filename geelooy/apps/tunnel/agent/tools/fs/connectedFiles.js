// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath, rel } = require("./pathGuard.js");
const { symbols } = require("./symbolOutline.js");
const { readBulk } = require("./bulkRead.js");
const { refsForConnectedText } = require("./connectedRefs.js");
const { pageState, describePage, nextPagePayload, parseLimit } = require("./bulkPage.js");

/**
 * B"H
 * Chapter 359: Connected Files Became A Living Constellation.
 * JS imports, HTML-delivered scripts, stylesheet @imports, link hrefs, import
 * maps, inline module bodies, and fetch roads are gathered into one graph. Then
 * only one generous page is read, so the next command can keep traveling.
 */

function slash(value) {
  return String(value || "").replace(/\\/g, "/");
}

async function fileExists(abs) {
  try { return (await fs.stat(abs)).isFile(); } catch (_) { return false; }
}

async function resolveExisting(config, refPath) {
  for (const candidate of [refPath, refPath + ".js", refPath + ".mjs", refPath + ".cjs", refPath + ".json", refPath + "/index.js"]) {
    const abs = safePath(config, candidate);
    if (await fileExists(abs)) return abs;
  }
  return null;
}

function fileRecord(config, abs, depth, text, mode, refInfo) {
  const filePath = rel(config, abs);
  return { path: filePath, depth, bytes: Buffer.byteLength(text), refs: refInfo.refs, refSources: refInfo.sources, merkava: refInfo.merkava, symbols: mode === "outline" ? symbols(text) : undefined, content: mode === "graph" ? undefined : text };
}

async function collectConnectedGraph(config, payload) {
  const entry = safePath(config, payload.path || payload.p || ".");
  const maxDepth = Number(payload.depth || payload.maxDepth || 4);
  const maxGraphFiles = Number(payload.maxGraphFiles || payload.scanMaxFiles || 1000);
  const mode = payload.mode || "full";
  const queue = [{ abs: entry, depth: 0 }], seen = new Set(), files = [], edges = [];
  while (queue.length && files.length < maxGraphFiles) {
    const { abs, depth } = queue.shift();
    if (seen.has(abs) || depth > maxDepth || !(await fileExists(abs))) continue;
    seen.add(abs);
    const text = await fs.readFile(abs, "utf8");
    const from = rel(config, abs);
    const refInfo = await refsForConnectedText(text, slash(from));
    files.push(fileRecord(config, abs, depth, text, mode, refInfo));
    for (const refPath of refInfo.refs) {
      const next = await resolveExisting(config, refPath);
      if (!next) continue;
      edges.push({ from, to: rel(config, next), depth: depth + 1 });
      if (!seen.has(next)) queue.push({ abs: next, depth: depth + 1 });
    }
  }
  return { entry: rel(config, entry), mode, maxDepth, files, edges, truncatedGraph: queue.length > 0 };
}

function pageGraph(graph, payload) {
  const state = pageState(payload, graph.files.length);
  const pageFiles = graph.files.slice(state.cursor, state.end);
  const paths = pageFiles.map(file => file.path);
  return { state, pageFiles, paths };
}

async function connectedFiles(config, payload) {
  const graph = await collectConnectedGraph(config, payload);
  const page = pageGraph(graph, payload);
  if (payload.readAsBulk || payload.bulk || payload.mode === "bulk") {
    return await readBulk(config, { ...payload, action: "bulk", paths: page.paths, p: "", page: 1, cursor: 0, maxFiles: page.paths.length || 1 });
  }
  const limits = { maxFiles: page.state.pageSize, maxChars: parseLimit(payload.maxChars, 12000), maxBytes: parseLimit(payload.maxBytes, 24000), totalMaxBytes: parseLimit(payload.totalMaxBytes ?? payload.totalMaxChars, Infinity), maxDepth: graph.maxDepth };
  return { ok: true, action: "connectedFiles", entry: graph.entry, mode: graph.mode, count: graph.files.length, returnedCount: page.pageFiles.length, page: page.state.page, cursor: page.state.cursor, nextCursor: page.state.nextCursor, pageSize: page.state.pageSize, partial: page.state.hasNext || graph.truncatedGraph, message: describePage("connected files read", page.state, limits), nextPagePayload: nextPagePayload(payload, "connectedFiles", page.state), edges: graph.edges, files: page.pageFiles };
}

module.exports = { connectedFiles, collectConnectedGraph, resolveExisting };
