// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildActions } = require("../../fs/actions.js");
const Defaults = require("../continuation/defaults.js");
const State = require("../continuation/state.js");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-chatgpt-continuation-"));
process.env.AWTSMOOS_HOME = tempRoot;
const config = { root: tempRoot, allowWrite: true, allowCommands: true, allowSecrets: false, tools: { chrome: true, fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true }, chrome: { enabled: true, port: 9223 } };

function testRegistration() {
  const actions = buildActions(config, { action: "chatgptContinuationStart" }, null);
  for (const name of ["chatgptContinuationStart", "chatgptContinuationStatus", "chatgptContinuationStop", "chatgptContinuationTick", "chatgptContinuationAuto", "chatgptContinuationConclusion", "chatgptOptimizeDom", "chatgptMessage"]) assert.equal(typeof actions[name], "function", name);
}

async function testStateWithoutBrowser() {
  const loop = State.makeLoop({ conversationUrl: "https://chatgpt.com/c/abc_DEF-123", prompt: Defaults.DEFAULT_PROMPT, maxTurns: Defaults.boundedTurns(9999), agentSessionId: "agent-session", logicalAgentId: "agent", roomId: "room", missionId: "mission" });
  assert.equal(loop.conversationId, "abc_DEF-123");
  assert.equal(loop.maxTurns, 400);
  const saved = await State.upsert(loop);
  assert.equal(saved.url, "https://chatgpt.com/c/abc_DEF-123");
  assert.equal((await State.get(loop.loopId)).agentSessionId, "agent-session");
  const stopped = await State.stop(loop.loopId, "test_stop");
  assert.equal(stopped.status, "stopped");
}

function testSourceBoundaries() {
  const index = fs.readFileSync(path.join(__dirname, "../index.js"), "utf8");
  const cont = fs.readFileSync(path.join(__dirname, "../actions/continuation.js"), "utf8");
  assert.ok(index.includes("chatgptContinuationStart"));
  assert.ok(cont.includes("chatgptContinuationConclusion"));
  assert.ok(cont.includes("./sessions.js"));
  assert.ok(!/while\s*\(\s*true\s*\)/.test(cont));
}

(async () => {
  testRegistration();
  await testStateWithoutBrowser();
  testSourceBoundaries();
  console.log(JSON.stringify({ ok: true, suite: "chatgpt-continuation-actions" }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
