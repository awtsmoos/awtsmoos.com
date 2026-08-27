// B"H
const { cleanPath } = require("./path.js");
const { listFolder, readWhole } = require("./listRead.js");
const { astOutline } = require("./astTools.js");
const { dependencyGraph } = require("./graph.js");

async function walkFiles($i, userId, payload, root = payload.path || payload.p || ".") {
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 80), 500));
  const maxDepth = Math.max(0, Math.min(Number(payload.depth || 4), 12));
  const files = [];
  async function visit(path, depth) {
    if (files.length >= maxFiles || depth > maxDepth) return;
    let listed;
    try { listed = await listFolder($i, userId, { ...payload, path }); }
    catch { return; }
    for (const item of listed.detailedItems || []) {
      if (files.length >= maxFiles) break;
      if (item.isDirectory) await visit(item.path, depth + 1);
      else files.push(item.path);
    }
  }
  await visit(root, 0);
  return files;
}

async function readMany($i, userId, payload) {
  const paths = await walkFiles($i, userId, payload);
  const out = [];
  for (const path of paths) {
    try {
      const got = await readWhole($i, userId, path);
      out.push({ path, content: got.content || "", bytes: Buffer.byteLength(got.content || "", "utf8") });
    } catch (e) {
      out.push({ path, error: e.message, bytes: 0, content: "" });
    }
  }
  return out;
}

async function jsonValidate($i, userId, payload) {
  try {
    const got = await readWhole($i, userId, payload.path || payload.p || ".");
    const parsed = JSON.parse(got.content || "null");
    return { ok: true, action: "jsonValidate", path: cleanPath(payload.path || payload.p), valid: true, type: Array.isArray(parsed) ? "array" : typeof parsed };
  } catch (e) {
    return { ok: false, action: "jsonValidate", path: cleanPath(payload.path || payload.p), valid: false, error: e.message };
  }
}

async function packageInfo($i, userId, payload) {
  const path = payload.path || payload.p || "package.json";
  const validated = await jsonValidate($i, userId, { ...payload, path });
  if (!validated.valid) return { ...validated, action: "packageInfo" };
  const got = await readWhole($i, userId, path);
  const pkg = JSON.parse(got.content || "{}");
  return { ok: true, action: "packageInfo", path: cleanPath(path), name: pkg.name || null, version: pkg.version || null, scripts: Object.keys(pkg.scripts || {}), dependencies: Object.keys(pkg.dependencies || {}), devDependencies: Object.keys(pkg.devDependencies || {}) };
}

async function projectOverview($i, userId, payload) {
  const files = await readMany($i, userId, payload);
  const extensions = {};
  for (const file of files) extensions[(file.path.split(".").pop() || "") || "none"] = (extensions[(file.path.split(".").pop() || "") || "none"] || 0) + 1;
  return { ok: true, action: "projectOverview", root: cleanPath(payload.path || payload.p || "."), fileCount: files.length, totalBytes: files.reduce((n, f) => n + f.bytes, 0), extensions, sampleFiles: files.slice(0, 20).map(f => f.path) };
}

async function textStats($i, userId, payload) {
  const files = await readMany($i, userId, payload);
  return { ok: true, action: "textStats", fileCount: files.length, totalBytes: files.reduce((n, f) => n + f.bytes, 0), totalLines: files.reduce((n, f) => n + String(f.content || "").split(/\r?\n/).length, 0), files: files.map(f => ({ path: f.path, bytes: f.bytes, lines: String(f.content || "").split(/\r?\n/).length })).slice(0, 100) };
}

async function recentFiles($i, userId, payload) {
  const files = await readMany($i, userId, payload);
  return { ok: true, action: "recentFiles", note: "Awtsmoos OS virtual files do not expose mtime here; returned bounded scan order.", files: files.map(f => ({ path: f.path, bytes: f.bytes })).slice(0, Number(payload.limit || 50)) };
}

async function largeFiles($i, userId, payload) {
  const files = await readMany($i, userId, payload);
  const minBytes = Number(payload.minBytes || 0);
  return { ok: true, action: "largeFiles", minBytes, files: files.filter(f => f.bytes >= minBytes).sort((a, b) => b.bytes - a.bytes).slice(0, Number(payload.limit || 50)).map(f => ({ path: f.path, bytes: f.bytes })) };
}

async function duplicateBasenames($i, userId, payload) {
  const files = await walkFiles($i, userId, payload);
  const by = {};
  for (const file of files) (by[file.split("/").pop()] ||= []).push(file);
  const duplicates = Object.entries(by).filter(([, paths]) => paths.length > 1).map(([name, paths]) => ({ name, paths }));
  return { ok: true, action: "duplicateBasenames", count: duplicates.length, duplicates };
}

async function routeAudit($i, userId, payload) {
  const files = await readMany($i, userId, { ...payload, maxFiles: payload.maxFiles || 120 });
  const routes = [];
  const re = /(?:app\.|router\.|routeTable|routes?\s*=|path\s*:|method\s*:|\bGET\b|\bPOST\b)/i;
  for (const file of files) if (re.test(file.content)) routes.push({ path: file.path, matches: (file.content.match(new RegExp(re, "gi")) || []).length });
  return { ok: true, action: "routeAudit", scannedFiles: files.length, routes };
}

async function agentSelfTest($i, userId, payload) {
  const overview = await projectOverview($i, userId, payload);
  const stats = await textStats($i, userId, payload);
  return { ok: true, action: "agentSelfTest", overview, stats, checks: { canList: true, canRead: true, hasFiles: overview.fileCount > 0 } };
}

async function architectureScore($i, userId, payload) {
  const overview = await projectOverview($i, userId, payload);
  const score = Math.max(0, Math.min(100, 50 + Math.min(overview.fileCount, 30) + (overview.extensions.js ? 10 : 0) + (overview.extensions.json ? 5 : 0)));
  return { ok: true, action: "architectureScore", score, overview, findings: [] };
}

async function inferArchitecture($i, userId, payload) {
  const overview = await projectOverview($i, userId, payload);
  return { ok: true, action: "inferArchitecture", overview, inference: { likelyJavaScript: !!overview.extensions.js, likelyWeb: !!overview.extensions.html, likelyConfig: !!overview.extensions.json } };
}

async function detectAbstractionLeaks($i, userId, payload) {
  const files = await readMany($i, userId, payload);
  const leaks = [];
  for (const file of files) {
    const hits = (file.content.match(/TODO|HACK|FIXME|console\.log|process\.env|absolutePath/g) || []).length;
    if (hits) leaks.push({ path: file.path, hits });
  }
  return { ok: true, action: "detectAbstractionLeaks", leaks };
}

module.exports = { jsonValidate, packageInfo, projectOverview, textStats, recentFiles, largeFiles, duplicateBasenames, routeAudit, agentSelfTest, architectureScore, inferArchitecture, detectAbstractionLeaks, walkFiles, readMany };
