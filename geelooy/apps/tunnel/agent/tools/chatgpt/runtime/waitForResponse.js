// B"H
const { idleScript, readIdleState, waitUntilIdle } = require("./idleDetector.js");

/** B"H: waits for the visible ChatGPT river to settle, not just for text. */
async function waitForResponse(payload = {}) {
  const waited = await waitUntilIdle(payload);
  return { ok: waited.ok !== false, action: "chatgptWaitForResponse", text: waited.text || "", durationMs: waited.durationMs || 0, state: waited.state || {}, idle: waited.idle === true, stableMs: waited.stableMs || 0, error: waited.error || "" };
}

function browserScript() { return idleScript(); }
module.exports = { waitForResponse, readAssistantState: readIdleState, browserScript };
