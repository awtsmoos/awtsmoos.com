// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { ensureConversation, getConversation, listConversations } = require("../core/conversationStore.js");

function params($i) {
  return { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) };
}

function requireUser($i) {
  const ident = currentIdentity($i);
  return ident.ok ? ident : null;
}

/**
 * B"H
 * Chapter 491: The control room learned to name the mission.
 *
 * @param {object} $i Dynamic request vessel.
 * @returns {Promise<object>} JSON response packet.
 */
async function conversationRegister($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const conversation = ensureConversation(ident.userId, {
    conversationId: p.conversationId || p.id,
    conversationName: p.conversationName || p.name || p.title
  });
  return json($i, { BH: "B\"H", ok: true, conversation });
}

async function conversationList($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  return json($i, { BH: "B\"H", ok: true, conversations: listConversations(ident.userId) });
}

async function conversationGet($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const conversation = getConversation(ident.userId, p.conversationId || p.id);
  return json($i, conversation ? { BH: "B\"H", ok: true, conversation } : { BH: "B\"H", ok: false, error: "conversation_not_found" }, conversation ? 200 : 404);
}

module.exports = { conversationGet, conversationList, conversationRegister };
