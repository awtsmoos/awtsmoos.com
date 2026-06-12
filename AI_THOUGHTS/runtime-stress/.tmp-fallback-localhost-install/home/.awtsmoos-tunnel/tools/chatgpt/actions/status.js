// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { readState } = require("../storage/profileState.js");
const { readRegistry, currentConversation } = require("../conversations/registry.js");

/** B"H: reports profile/session/conversation state without exposing secrets. */
async function chatgptStatus(payload = {}) {
  const state = await readState();
  if (payload.open === true || payload.open === "true") await ensureProfileChrome(payload);
  let session = null;
  try { session = (await sessionCheck(payload)).session; } catch (error) { session = { authenticated: false, error: error.message }; }
  return { ok: true, action: "chatgptStatus", state, session, registry: await readRegistry(), currentConversation: await currentConversation() };
}

module.exports = { chatgptStatus };
