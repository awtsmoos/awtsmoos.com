#!/usr/bin/env node
// B"H
const fs = require("fs/promises");
const path = require("path");

function findRepoRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (require("fs").existsSync(path.join(dir, "geelooy/apps/tunnel/agent/main.js"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not find awtsmoos.com repo root.");
}

const REPO_ROOT = findRepoRoot(__dirname);
const { createLocalApiServer } = require(path.join(REPO_ROOT, "geelooy/apps/tunnel/agent/lib/local-api.js"));
const { buildActions } = require(path.join(REPO_ROOT, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));
const ROOT = path.join(__dirname, ".tmp-local-api-direct");

function config() {
  return {
    tunnelName: "local-api-test",
    root: ROOT,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true, command: true, chrome: true }
  };
}

async function fsHandler(payload) {
  const table = buildActions(config(), payload, null);
  const fn = table[payload.action];
  if (!fn) return { ok: false, error: "missing_action", availableActions: Object.keys(table) };
  return await fn();
}

function makeServer() {
  return createLocalApiServer({
    configLoader: config,
    fsHandler,
    commandHandler: async payload => ({ ok: true, action: payload.action, kind: payload.kind }),
    chromeHandler: async payload => ({ ok: true, action: payload.action, kind: payload.kind })
  });
}

async function listen(server) {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

async function request(base, route, body) {
  const init = body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {};
  const res = await fetch(base + route, init);
  const json = await res.json();
  if (!res.ok) throw new Error(`${route} failed ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  await fs.rm(ROOT, { recursive: true, force: true });
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, "alpha.txt"), "B'H alpha\nsecond line\n", "utf8");
  await fs.writeFile(path.join(ROOT, "package.json"), JSON.stringify({ scripts: { test: "node ok.js" } }), "utf8");

  const server = makeServer();
  const base = await listen(server);
  try {
    const health = await request(base, "/health");
    if (!health.ok || !health.actions.fs.includes("bulkWrite")) throw new Error("health missing fs actions");

    const read = await request(base, "/tool", { name: "read", arguments: { path: "alpha.txt", maxChars: 80 } });
    if (!read.ok || !read.content.includes("alpha")) throw new Error("tool read failed");

    const bulkWrite = await request(base, "/tool", { name: "bulkWrite", arguments: { writes: [{ path: "beta.txt", content: "B" }, { path: "gamma.txt", content: "G" }] } });
    if (!bulkWrite.ok || bulkWrite.okCount !== 2) throw new Error("tool bulkWrite failed");

    const many = await request(base, "/fs", { action: "readManyLines", ranges: [{ path: "alpha.txt", startLine: 1, endLine: 2 }] });
    if (!many.ok) throw new Error("readManyLines failed");

    const context = await request(base, "/context", { path: ".", goal: "inspect project" });
    if (!context.ok || context.action !== "aiContextPack") throw new Error("context endpoint failed");

    const command = await request(base, "/tool", { name: "commandRun", arguments: { command: "pwd" } });
    if (!command.ok || command.kind !== "command") throw new Error("command route failed");

    console.log(JSON.stringify({ ok: true, base, actions: health.actions.fs.length }));
  } finally {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(ROOT, { recursive: true, force: true });
  }
}

main().catch(err => { console.error(err); process.exit(1); });
