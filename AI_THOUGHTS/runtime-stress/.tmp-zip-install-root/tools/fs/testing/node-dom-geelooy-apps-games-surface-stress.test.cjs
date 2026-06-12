// B"H
/**
 * Connected surface stress for every discovered HTML entry under geelooy/apps
 * and geelooy/games. It collects delivered JS/CSS/module files before calling
 * simulateRuntime({ engine: "node-dom" }).
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));
const { collectConnectedGraph } = require(path.join(__dirname, "../connectedFiles.js"));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name), st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else if (/\.html?$/i.test(name)) out.push(p);
  }
  return out;
}
function rel(p) { return p.replace(/\\/g, "/"); }
function entries() { return [...walk("apps"), ...walk("games")].filter(p => !p.includes("/.tmp-")).sort(); }
async function filesFor(entry) {
  const cfg = { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsBulk: true } };
  const graph = await collectConnectedGraph(cfg, { path: entry, maxDepth: Number(process.env.NODE_DOM_STRESS_DEPTH || 4), mode: "full" });
  const files = {};
  for (const file of graph.files || []) files[file.path] = file.content || "";
  if (!files[entry]) files[entry] = fs.readFileSync(entry, "utf8");
  return { files, graphCount: graph.files.length, truncatedGraph: graph.truncatedGraph };
}
async function runOne(file) {
  const entry = rel(file);
  const { files, graphCount, truncatedGraph } = await filesFor(entry);
  const r = await simulateNodeDomRuntime({ entry, files, waitMs: Number(process.env.NODE_DOM_STRESS_WAIT_MS || 0), returnValues: ["document.readyState"], format: "json" });
  return { entry, ok: !!r.ok, engine: r.engine, graphCount, truncatedGraph: !!truncatedGraph, errorCount: (r.errors || []).length, errors: (r.errors || []).slice(0, 3).map(e => e.message || String(e)), readyState: r.values?.["document.readyState"] };
}
(async () => {
  const all = entries();
  const limit = Number(process.env.NODE_DOM_STRESS_LIMIT || all.length);
  const results = [];
  for (const file of all.slice(0, limit)) results.push(await runOne(file));
  const summary = { ok: true, discovered: all.length, tested: results.length, passed: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length };
  console.log(JSON.stringify({ summary, failures: results.filter(r => !r.ok).slice(0, 25), sample: results.slice(0, 10) }, null, 2));
  assert.ok(all.length > 0, "No app/game HTML entries discovered");
  assert.equal(results.length, Math.min(limit, all.length));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
