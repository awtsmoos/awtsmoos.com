// B"H
const assert = require("assert");
const { dispatchOsFs } = require("../index.js");
const { supportAction } = require("../supportActions.js");
const { tasks } = require("../virtualAiAgents.js");

/**
 * B"H
 * Chapter 378: Two Users Entered One Hosted Palace And Never Shared A Door.
 *
 * These isolated tests do not need a local tunnel. They stub MiniMax fetch,
 * create two logged-in users, route every filesystem touch through dispatchOsFs,
 * and prove the same YAML-facing action names can reach the Virtual OS safely.
 */
function makeDb(seed = {}) { const map = new Map(Object.entries(seed)); return { async get(path) { return map.get(path); }, async read(path) { return map.get(path); }, async write(path, value = {}) { map.set(path, value); return { ok: true, path }; }, async delete(path) { const had = map.delete(path); return { ok: true, deleted: had, path }; }, dump() { return Object.fromEntries(map); } }; }
function seed(user, text) { return { [`/users/${user}/aliases/home`]: { aliasId: "home" }, "/social/aliases/home/fileSystem/notes/a.txt": text }; }
function ctx(seedData) { return { db: makeDb(seedData), ws: { clients: [] } }; }
async function dispatchFor($i, userId, payload) { return dispatchOsFs($i, userId, { ...payload, tunnelName: "awtsmoos-virtual-os", targetVessel: "virtual-os" }); }
async function safeDispatch($i, userId, payload) { try { return await dispatchFor($i, userId, payload); } catch (error) { return { ok: false, error: error.message, status: error.status || 500 }; } }
function stubMiniMax() { global.fetch = async (_url, request) => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "VOS_OK " + JSON.parse(request.body).messages.at(-1).content.slice(0, 40) } }], usage: { total_tokens: 12 } }), text: async () => "{}" }); }
async function testUserIsolation() {
  const a = ctx(seed("alice", "alice secret")); const b = ctx(seed("bob", "bob secret"));
  const ra = await dispatchFor(a, "alice", { action: "read", path: "home/notes/a.txt" });
  const rb = await dispatchFor(b, "bob", { action: "read", path: "home/notes/a.txt" });
  assert.equal(ra.content, "alice secret"); assert.equal(rb.content, "bob secret");
  const denied = await safeDispatch(a, "mallory", { action: "read", path: "home/notes/a.txt" });
  assert.equal(denied.ok, false); assert.equal(denied.error, "alias_not_owned");
}
async function testAiListAndMessage() {
  stubMiniMax(); const $i = ctx(seed("alice", "virtual context"));
  const list = await supportAction("aiAgentList", { action: "aiAgentList" }, next => dispatchFor($i, "alice", next));
  assert.equal(list.ok, true); assert.equal(list.vessel, "virtual-os"); assert.ok(list.agents.some(a => a.id === "minimax-deep"));
  const msg = await supportAction("aiAgentMessage", { action: "aiAgentMessage", provider: "minimax", agentId: "minimax-deep", path: "home/notes/a.txt", message: "say hello" }, next => dispatchFor($i, "alice", next));
  assert.equal(msg.ok, true); assert.equal(msg.vessel, "virtual-os"); assert.match(msg.text, /VOS_OK/);
}
async function testSpawnAndOutput() {
  stubMiniMax(); tasks.length = 0; const $i = ctx(seed("alice", "spawn context"));
  const spawn = await supportAction("aiAgentSpawnTask", { action: "aiAgentSpawnTask", provider: "minimax", agentId: "minimax-deep", path: "home/notes/a.txt", message: "write result", outputDir: "home/out", fileName: "ai.md" }, next => dispatchFor($i, "alice", next));
  assert.equal(spawn.ok, true); assert.equal(spawn.vessel, "virtual-os");
  await new Promise(resolve => setTimeout(resolve, 20));
  const status = await supportAction("aiAgentTaskStatus", { taskId: spawn.taskId }, next => dispatchFor($i, "alice", next));
  assert.equal(status.task.status, "complete");
  const wrote = await dispatchFor($i, "alice", { action: "read", path: "home/out/ai.md" });
  assert.match(wrote.content, /VOS_OK/);
}
async function run() { await testUserIsolation(); await testAiListAndMessage(); await testSpawnAndOutput(); console.log(JSON.stringify({ ok: true, tests: ["user-isolation", "minimax-message", "spawn-output"], tasks: tasks.length }, null, 2)); }
run().catch(error => { console.error(error.stack || error); process.exit(1); });
