// B"H
/**
 * @file node-dom-public-server-surface-stress.test.cjs
 * @description
 * Chapter 372: The public gate is the test. These entries are tested through
 * http://127.0.0.1:8080 so /apps, /games, /scripts, and /style mean what they
 * mean on awtsmoos.com, not what an isolated fixture guesses.
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildRuntimeActions } = require("../actionGroups/runtimeActions.js");
const ORIGIN = process.env.AWTSMOOS_TEST_ORIGIN || "http://127.0.0.1:8080";
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const name of fs.readdirSync(dir)) { const p = path.join(dir, name), st = fs.statSync(p); if (st.isDirectory()) walk(p, out); else if (/\.html?$/i.test(name)) out.push(p); } return out; }
function entries() { return [...walk("apps"), ...walk("games")].filter(p => !p.includes("/.tmp-")).sort(); }
function urlFor(file) { return ORIGIN + "/" + file.replace(/\\/g, "/"); }
async function runOne(file) {
  const payload = { action: "simulateRuntime", engine: "node-dom", url: urlFor(file), waitMs: Number(process.env.NODE_DOM_PUBLIC_WAIT_MS || 30), returnValues: ["document.readyState", "document.title"] };
  const config = { root: process.cwd(), tools: { fsRead: true, fsBulk: true } };
  const r = await buildRuntimeActions({ payload, config }).simulateRuntime();
  return { url: payload.url, ok: !!r.ok, engine: r.engine, errorCount: (r.errors || []).length, errors: (r.errors || []).slice(0, 3).map(e => e.message || String(e)), values: r.values };
}
(async () => {
  const all = entries();
  const limit = Number(process.env.NODE_DOM_PUBLIC_LIMIT || all.length);
  const selected = all.slice(0, limit);
  const results = [];
  for (const file of selected) results.push(await runOne(file));
  const summary = { ok: true, origin: ORIGIN, discovered: all.length, tested: results.length, passed: results.filter(x => x.ok).length, failed: results.filter(x => !x.ok).length };
  console.log(JSON.stringify({ summary, failures: results.filter(x => !x.ok).slice(0, 25), sample: results.slice(0, 8) }, null, 2));
  assert.ok(all.length > 0, "No public HTML entries discovered");
  assert.equal(results.length, selected.length);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
