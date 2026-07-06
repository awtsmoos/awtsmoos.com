// B"H
const assert = require("assert"), fs = require("fs"), os = require("os"), path = require("path");
process.env.AWTSMOOS_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-cgpt-session-"));
const { buildActions } = require("../../fs/actions.js");
const State = require("../sessions/state.js");
const Identity = require("../sessions/identity.js");
const { appendSessionEvent } = require("../sessions/journal.js");
const { writeSessionReceipt } = require("../sessions/receipts.js");
const config = { root:process.env.AWTSMOOS_HOME, allowWrite:true, allowCommands:true, allowSecrets:false, tools:{ chrome:true, fsRead:true, fsWrite:true, fsBulk:true, fsList:true, fsTree:true }, chrome:{ enabled:true, port:9223 } };
(async () => {
  assert.equal(Identity.conversationIdFrom({ url:"https://chatgpt.com/c/abc_DEF-123" }), "abc_DEF-123");
  const actions = buildActions(config, { action:"chatgptRegisterSession", url:"https://chatgpt.com/c/abc_DEF-123", agentSessionId:"agent-a", missionId:"mission-a" }, null);
  for (const name of ["chatgptRegisterSession", "chatgptSaveCurrentSeason", "chatgptRegisterConversationUrl", "chatgptSessionStatus", "chatgptSessionContinue", "chatgptSessionAuto", "chatgptSessionStop", "chatgptSessionConclusion", "chatgptSessionDoctor", "chatgptListSessions"]) assert.equal(typeof actions[name], "function", name);
  const session = await State.registerSession({ url:"https://chatgpt.com/c/abc_DEF-123", agentSessionId:"agent-a", missionId:"mission-a", maxTurns:9999 });
  assert.equal(session.sessionId, "chatgpt_abc_DEF-123");
  assert.equal(session.maxTurns, 400);
  assert.equal(session.agentSessionId, "agent-a");
  await appendSessionEvent(session.sessionId, { type:"test_event" });
  const receipt = await writeSessionReceipt(session.sessionId, { prompt:"hello", text:"world", ok:true });
  assert.ok(receipt.promptHash && receipt.responseHash);
  const stopped = await State.stopSession(session.sessionId, "test_stop");
  assert.equal(stopped.status, "stopped");
  console.log(JSON.stringify({ ok:true, suite:"chatgpt-session-actions", sessionId:session.sessionId }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
