// B"H
const { listFolder, readFile } = require("./listRead.js");

/**
 * Chapter 22: The Finder Learned to See Without a Shell.
 *
 * The Awtsmoos breathes letters through every file. This searcher walks only
 * the permitted route-root, reads bounded text, honors rg-like extension
 * filters, and returns paged line witnesses so an AI can continue without
 * shelling out to ripgrep.
 */
async function textSearch($i, userId, payload) {
  const roots = parseRoots(payload);
  const query = String(payload.query || payload.find || payload.text || "");
  const maxFiles = Number(payload.maxFiles || 500);
  const maxChars = Number(payload.maxChars || 12000);
  const page = Math.max(1, Number(payload.page || 1));
  const pageSize = Math.max(1, Number(payload.pageSize || payload.limit || 80));
  const allResults = [];
  const files = [];
  for (const root of roots) await collectFiles($i, userId, payload, root, files, maxFiles);
  for (const file of files) {
    const got = await safeRead($i, userId, { ...payload, path: file, maxChars });
    if (!got.ok || !matchesTextFile(file, payload)) continue;
    collectMatches(allResults, file, got.content || "", query);
  }
  const start = (page - 1) * pageSize;
  const results = allResults.slice(start, start + pageSize);
  return { ok: true, action: payload.action || "find", path: roots.join(","), query, scannedFiles: files.length, totalResults: allResults.length, page, pageSize, returnedResults: results.length, nextPage: start + results.length < allResults.length ? page + 1 : null, results };
}

function parseRoots(payload) {
  const raw = payload.paths || payload.files || payload.path || payload.p || ".";
  return Array.isArray(raw) ? raw : String(raw).split(/\n|,/).map(s => s.trim()).filter(Boolean);
}

async function collectFiles($i, userId, payload, dir, out, maxFiles) {
  if (out.length >= maxFiles) return;
  const listed = await listFolder($i, userId, { ...payload, path: dir });
  for (const item of listed.detailedItems || []) {
    if (out.length >= maxFiles) break;
    if (item.isDirectory) await collectFiles($i, userId, payload, item.path, out, maxFiles);
    else out.push(item.path);
  }
}

async function safeRead($i, userId, payload) {
  try { return await readFile($i, userId, payload); }
  catch (error) { return { ok: false, error: error.message }; }
}

function collectMatches(results, file, content, query) {
  if (!query) return;
  const needle = String(query);
  String(content).split(/\r?\n/).forEach((line, index) => {
    if (line.includes(needle)) results.push({ path: file, line: index + 1, preview: line.trim().slice(0, 300) });
  });
}

function matchesTextFile(file, payload = {}) {
  const ext = String(payload.ext || payload.glob || payload.g || "").replace(/^\*?\.?/, "").toLowerCase();
  if (ext && !file.toLowerCase().endsWith(`.${ext}`)) return false;
  return /\.(js|cjs|mjs|json|yaml|yml|html|css|md|txt)$/i.test(file);
}

module.exports = { textSearch };
