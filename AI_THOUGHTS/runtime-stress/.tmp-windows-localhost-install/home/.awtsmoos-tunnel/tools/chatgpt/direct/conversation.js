// B"H
const { directAuth, requestHeaders, CHATGPT_ORIGIN } = require("./auth.js");
const { messageId } = require("./ids.js");
const { readChatGptSse, messageText } = require("./sse.js");
const { sentinelHeaders } = require("./sentinel.js");
const { prepareDirectRequest, F_CONVERSATION_PATH } = require("./prepareRequest.js");
const { legacyConversationHeaders, legacyConversationBody, summarizeLegacyRequest } = require("./legacyRequest.js");

/**
 * B"H
 * Chapter 431: Node Learned To Knock Before It Spoke.
 *
 * The direct sender now follows the traced browser order: authenticate, resolve
 * parent, prepare conduit and sentinel material, then build the final request
 * from the prepared vessel. The old proof is retained only as a companion, while
 * the new prepare tokens decide the shape of the turn.
 */
async function sendDirectChatGptMessage(payload = {}) {
  const message = String(payload.message || payload.prompt || payload.text || "");
  if (!message) return { ok: false, action: "chatgptDirectMessage", error: "missing_message" };
  const auth = await directAuth(payload);
  if (!auth.authenticated || !auth.token) return notAuthenticated(auth);
  const parent = await parentFor(payload, auth);
  const userMessageId = messageId();
  const prepared = await prepareDirectRequest({ auth, payload });
  const body = legacyConversationBody({ payload, message, parentMessageId: parent.parentMessageId, userMessageId, prepared });
  const sentinels = await sentinelHeaders(auth).catch(() => ({}));
  const headers = legacyConversationHeaders(auth, sentinels, prepared);
  const response = await fetch(`${CHATGPT_ORIGIN}${F_CONVERSATION_PATH}`, { method: "POST", headers, body: JSON.stringify(body), redirect: "manual", duplex: "half" });
  const sent = { ok: response.ok, userMessageId, prepare: summarizePrepare(prepared), sentinel: summarizeSentinels(sentinels), observedFormat: summarizeLegacyRequest(headers, body) };
  if (!response.ok) return await failedResponse(response, auth, parent, sent);
  const stream = await readChatGptSse(response);
  const proof = await verifyWhenPossible({ payload, auth, parent, userMessageId, stream });
  return { ok: true, action: "chatgptDirectMessage", transport: "node-fetch", session: auth.session, parent, sent, response: { ...stream, proof }, text: proof.text || stream.text || "" };
}

function notAuthenticated(auth) {
  return { ok: false, action: "chatgptDirectMessage", error: "not_authenticated", loginRequired: true, session: auth.session };
}

async function parentFor(payload, auth) {
  const conversationId = payload.conversationId || payload.id || "";
  if (!conversationId) return { conversationId: "", parentMessageId: payload.parentMessageId || "client-created-root", source: "new_f_conversation" };
  if (payload.parentMessageId) return { conversationId, parentMessageId: payload.parentMessageId, source: "payload" };
  const convo = await getConversation(conversationId, auth);
  return { conversationId, parentMessageId: convo.current_node || "client-created-root", source: "conversation", title: convo.title || "" };
}

async function getConversation(conversationId, auth) {
  const response = await fetch(`${CHATGPT_ORIGIN}/backend-api/conversation/${encodeURIComponent(conversationId)}`, { headers: requestHeaders(auth), redirect: "manual" });
  if (!response.ok) throw new Error(`ChatGPT conversation load failed: ${response.status}`);
  return await response.json();
}

async function verifyWhenPossible({ payload, auth, parent, userMessageId, stream }) {
  const conversationId = stream.conversationId || parent.conversationId || payload.conversationId || "";
  if (!conversationId) return { ok: Boolean(stream.text), reason: "missing_conversation_id", text: stream.text || "" };
  const parentNodeId = parent.parentMessageId || "";
  let best = { ok: false, text: stream.text || "", conversationId };
  for (let i = 0; i < Number(payload.verifyPolls || 24); i++) {
    const convo = await getConversation(conversationId, auth).catch(() => null);
    const proof = verifyAdvance({ convo, parentNodeId, userMessageId, fallbackText: best.text });
    if (proof.text && proof.text.length >= String(best.text || "").length) best = proof;
    if (proof.ok) return proof;
    await sleep(500 + Math.min(i, 10) * 250);
  }
  return best;
}

function verifyAdvance({ convo, parentNodeId, userMessageId, fallbackText }) {
  const currentNodeId = convo?.current_node || "";
  const current = currentMessage(convo);
  const chain = chainToRoot(convo, currentNodeId);
  const text = messageText(current) || fallbackText || "";
  return { ok: Boolean(currentNodeId && currentNodeId !== parentNodeId && current?.author?.role === "assistant" && isSettledAssistant(current) && text && (!parentNodeId || chain.includes(parentNodeId)) && (!userMessageId || chain.includes(userMessageId))), conversationId: convo?.conversation_id || convo?.id || "", assistantMessageId: current?.id || currentNodeId, currentNodeId, parentNodeId, userMessageId, text };
}

function currentMessage(convo) { return convo?.mapping?.[convo?.current_node]?.message || null; }
function chainToRoot(convo, nodeId) {
  const mapping = convo?.mapping || {};
  const out = [];
  const seen = new Set();
  let id = nodeId;
  while (id && mapping[id] && !seen.has(id) && out.length < 500) { out.push(id); seen.add(id); id = mapping[id].parent || mapping[id].parent_id || ""; }
  return out;
}
function isSettledAssistant(node) {
  if (node?.author?.role !== "assistant") return false;
  const status = String(node.status || node.metadata?.status || "");
  if (/progress|stream|running|pending|queued|incomplete/i.test(status)) return false;
  if (node.metadata?.is_complete === false || node.metadata?.finished === false) return false;
  return Boolean(messageText(node) || /finished|complete|success|stop/i.test(status));
}

async function failedResponse(response, auth, parent, sent) {
  const detail = await response.text().catch(() => "");
  return { ok: false, action: "chatgptDirectMessage", error: "direct_post_failed", status: response.status, detail: detail.slice(0, 2000), session: auth.session, parent, sent };
}
function summarizeSentinels(headers = {}) { return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, { present: Boolean(value), length: String(value || "").length }])); }
function summarizePrepare(prepared = {}) { return { ok: Boolean(prepared.ok), paths: { conversation: prepared.conversation, sentinelPrepare: prepared.sentinelPrepare, sentinelFinalize: prepared.sentinelFinalize }, tokenLengths: Object.fromEntries(Object.entries(prepared.tokens || {}).map(([key, value]) => [key, String(value || "").length])) }; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = { sendDirectChatGptMessage, parentFor, getConversation, verifyAdvance, messageText, F_CONVERSATION_PATH };
