// B"H
const { CHATGPT_ORIGIN } = require("./auth.js");
const { F_CONVERSATION_PATH } = require("./prepareRequest.js");

/**
 * B"H
 * Chapter 429: The Request Remembered The Prepare Crown.
 *
 * The old garment only knew bearer, cookie, proof, and body. The new trace
 * showed a fuller crown: OAI client identity, turn trace, conduit, prepare
 * token, finalized requirements token, and then the same `/f/conversation`
 * stream. This module now forges headers and body from a single prepared
 * request vessel so every transport speaks one dialect.
 */
function legacyConversationHeaders(auth, sentinels = {}, prepared = {}) {
  const client = prepared.clientHeaders || {};
  const tokens = prepared.tokens || {};
  const headers = compactHeaders({
    ...client,
    accept: "text/event-stream",
    "content-type": "application/json",
    authorization: `Bearer ${auth.token}`,
    "x-oai-turn-trace-id": prepared.turnTraceId || "",
    "x-openai-target-path": F_CONVERSATION_PATH,
    "x-openai-target-route": F_CONVERSATION_PATH,
    "x-conduit-token": tokens.conduitToken || "",
    "openai-sentinel-chat-requirements-prepare-token": tokens.prepareToken || "",
    "openai-sentinel-chat-requirements-token": tokens.finalizedToken || sentinels["openai-sentinel-chat-requirements-token"] || "",
    "openai-sentinel-proof-token": sentinels["openai-sentinel-proof-token"] || "",
    "openai-sentinel-turnstile-token": sentinels["openai-sentinel-turnstile-token"] || ""
  });
  if (auth.cookie) headers.cookie = auth.cookie;
  if (auth.userAgent) headers["user-agent"] = auth.userAgent;
  return headers;
}

function legacyConversationBody({ payload, message, parentMessageId, userMessageId, prepared }) {
  const conversationId = payload.conversationId || payload.id || "";
  const body = {
    action: "next",
    messages: [userMessage({ id: userMessageId, message })],
    parent_message_id: parentMessageId || "client-created-root",
    model: payload.model || "gpt-5-5",
    client_prepare_state: clientPrepareState(payload, prepared),
    timezone_offset_min: Number(payload.timezoneOffsetMin ?? new Date().getTimezoneOffset()),
    timezone: payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    conversation_mode: payload.conversationMode || { kind: "primary_assistant" },
    enable_message_followups: true,
    system_hints: Array.isArray(payload.systemHints) ? payload.systemHints : [],
    supports_buffering: true,
    supported_encodings: ["v1"],
    client_contextual_info: contextualInfo(payload),
    paragen_cot_summary_display_override: "allow",
    force_parallel_switch: payload.forceParallelSwitch || "auto"
  };
  if (conversationId) body.conversation_id = conversationId;
  return mergePayloadOverrides(body, payload);
}

function clientPrepareState(payload = {}, prepared = {}) {
  if (payload.clientPrepareState) return payload.clientPrepareState;
  if (prepared?.conversation?.ok || prepared?.tokens?.conduitToken) return "success";
  return "none";
}

function userMessage({ id, message }) {
  return {
    id,
    author: { role: "user" },
    create_time: Date.now() / 1000,
    content: { content_type: "text", parts: [message] },
    metadata: {
      selected_sources: [],
      selected_github_repos: [],
      selected_all_github_repos: false,
      serialization_metadata: { custom_symbol_offsets: [] }
    }
  };
}

function contextualInfo(payload = {}) {
  return {
    is_dark_mode: Boolean(payload.isDarkMode),
    time_since_loaded: Number(payload.timeSinceLoaded || 3),
    page_height: Number(payload.pageHeight || 768),
    page_width: Number(payload.pageWidth || 1366),
    pixel_ratio: Number(payload.pixelRatio || 1),
    screen_height: Number(payload.screenHeight || 768),
    screen_width: Number(payload.screenWidth || 1366),
    app_name: "chatgpt.com"
  };
}

function legacySentinelHeaders(auth) {
  const headers = compactHeaders({ authorization: `Bearer ${auth.token}` });
  if (auth.cookie) headers.cookie = auth.cookie;
  if (auth.userAgent) headers["user-agent"] = auth.userAgent;
  return headers;
}

function summarizeLegacyRequest(headers = {}, body = {}) {
  return {
    url: `${CHATGPT_ORIGIN}${F_CONVERSATION_PATH}`,
    headerNames: Object.keys(headers).sort(),
    tokenHeaderNames: Object.keys(headers).filter(key => /token/i.test(key)).sort(),
    bodyKeys: Object.keys(body).sort(),
    model: body.model,
    parentMessageId: body.parent_message_id,
    clientPrepareState: body.client_prepare_state,
    hasConversationId: Boolean(body.conversation_id)
  };
}

function mergePayloadOverrides(body, payload = {}) {
  return {
    ...body,
    ...(payload.more && typeof payload.more === "object" ? payload.more : {}),
    ...(payload.chatgptModePayload && typeof payload.chatgptModePayload === "object" ? payload.chatgptModePayload : {})
  };
}
function compactHeaders(headers = {}) { return Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined && value !== null && String(value) !== "")); }

module.exports = { legacyConversationHeaders, legacyConversationBody, legacySentinelHeaders, summarizeLegacyRequest, clientPrepareState };
