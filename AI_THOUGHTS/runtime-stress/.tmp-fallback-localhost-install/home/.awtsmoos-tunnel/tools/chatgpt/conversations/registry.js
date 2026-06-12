// B"H
const { registryPath } = require("../storage/paths.js");
const { readJson, writeJson } = require("../storage/jsonStore.js");

/**
 * B"H
 * Conversation ids are references, not secrets. They let the tunnel continue a
 * visible ChatGPT thread without storing account credentials.
 */
async function readRegistry() {
  return await readJson(registryPath(), { current: null, conversations: {} });
}

async function rememberConversation(info = {}) {
  const registry = await readRegistry();
  const id = info.conversationId || info.id;
  if (!id) return registry;
  registry.current = id;
  registry.conversations[id] = { ...(registry.conversations[id] || {}), ...info, conversationId: id, updatedAt: new Date().toISOString() };
  await writeJson(registryPath(), registry);
  return registry.conversations[id];
}

async function currentConversation() {
  const registry = await readRegistry();
  return registry.current ? registry.conversations[registry.current] || null : null;
}

function idFromUrl(url = "") {
  const match = String(url || "").match(/\/c\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

module.exports = { readRegistry, rememberConversation, currentConversation, idFromUrl };
