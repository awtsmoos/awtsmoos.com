#!/usr/bin/env node
// B"H
const path = require("path");
const fs = require("fs/promises");

function findRepoRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    try { require("fs").accessSync(path.join(dir, "geelooy/apps/tunnel/agent/main.js")); return dir; }
    catch { dir = path.dirname(dir); }
  }
  throw new Error("repo root not found");
}

const REPO = findRepoRoot(__dirname);
const { createLocalApiServer } = require(path.join(REPO, "geelooy/apps/tunnel/agent/lib/local-api.js"));
const { buildActions } = require(path.join(REPO, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));
const ROOT = path.join(__dirname, ".tmp-schema-catalog");

function config() {
  return { tunnelName: "schema-catalog-test", root: ROOT, allowWrite: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, command: true, chrome: true } };
}
async function fsHandler(payload) {
  const actions = buildActions(config(), payload, null);
  const fn = actions[payload.action];
  return fn ? await fn() : { ok: false, error: "missing" };
}
function server() {
  return createLocalApiServer({ configLoader: config, fsHandler, commandHandler: async p => ({ ok: true, action: p.action }), chromeHandler: async p => ({ ok: true, action: p.action }) });
}
function listen(s) { return new Promise(resolve => s.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${s.address().port}`))); }
async function get(base, route) { const res = await fetch(base + route); const json = await res.json(); if (!res.ok) throw new Error(`${route} ${res.status}`); return json; }

(async () => {
  await fs.rm(ROOT, { recursive: true, force: true });
  await fs.mkdir(ROOT, { recursive: true });
  const s = server();
  const base = await listen(s);
  try {
    const actions = await get(base, "/actions");
    const tools = await get(base, "/tools");
    const schemas = await get(base, "/schemas");
    const manifest = await get(base, "/manifest");
    const readTool = tools.tools.find(t => t.name === "read");
    const writeSchema = schemas.schemas.write;
    console.log(JSON.stringify({ actionKeys: Object.keys(actions.actions), toolCount: tools.tools.length, readTool, hasYaml: /tools:/i.test(manifest.yaml || "") }, null, 2));
    if (!actions.actions.fs.includes("simulateRuntime")) throw new Error("/actions missing fs names");
    if (!readTool?.function?.parameters?.properties?.path) throw new Error("/tools read schema missing path");
    if (!writeSchema?.properties?.content) throw new Error("/schemas write missing content");
    if (!manifest.yaml || !manifest.yaml.includes("simulateRuntime")) throw new Error("/manifest yaml missing tools");
    if (manifest.tools.length !== tools.tools.length) throw new Error("manifest/tools not same generator");
  } finally {
    await new Promise(resolve => s.close(resolve));
    await fs.rm(ROOT, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exit(1); });
