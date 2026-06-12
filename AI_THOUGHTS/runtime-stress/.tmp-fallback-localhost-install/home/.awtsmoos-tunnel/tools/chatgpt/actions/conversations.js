// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { readCurrentConversation } = require("../conversations/current.js");
const { readRegistry } = require("../conversations/registry.js");

/** B"H: opens a clean ChatGPT page for a new conversation. */
async function chatgptNewConversation(payload = {}) {
  const opened = await ensureProfileChrome({ ...payload, url: "https://chatgpt.com/", navigate: true });
  return { ok: true, action: "chatgptNewConversation", port: opened.port, url: "https://chatgpt.com/", profile: opened.profile };
}

async function chatgptCurrentConversation(payload = {}) {
  const opened = await ensureProfileChrome({ ...payload, navigate: false });
  return await readCurrentConversation({ ...payload, port: opened.port });
}

async function chatgptListConversations() {
  const registry = await readRegistry();
  return { ok: true, action: "chatgptListConversations", current: registry.current, conversations: Object.values(registry.conversations || {}) };
}

module.exports = { chatgptNewConversation, chatgptCurrentConversation, chatgptListConversations };
