// B"H
const assert = require("assert"), fs = require("fs"), os = require("os"), path = require("path");
process.env.AWTSMOOS_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-cgpt-compat-"));
const C = require("../actions/continuation.js");
(async () => {
  const start = await C.chatgptContinuationStart({ url:"https://chatgpt.com/c/compat_123", maxTurns:40 });
  assert.equal(start.action, "chatgptContinuationStart");
  assert.equal(start.loop.loopId, "chatgpt_compat_123");
  assert.equal(start.loop.maxTurns, 40);
  const status = await C.chatgptContinuationStatus({ loopId:start.loop.loopId });
  assert.equal(status.loop.loopId, start.loop.loopId);
  const stopped = await C.chatgptContinuationStop({ loopId:start.loop.loopId, reason:"compat_stop" });
  assert.equal(stopped.loop.status, "stopped");
  const conclusion = await C.chatgptContinuationConclusion({ loopId:start.loop.loopId });
  assert.equal(conclusion.loop.loopId, start.loop.loopId);
  console.log(JSON.stringify({ ok:true, suite:"chatgpt-session-compat" }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
