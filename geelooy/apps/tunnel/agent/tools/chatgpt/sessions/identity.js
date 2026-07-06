// B"H
const crypto = require("crypto");
const { idFromUrl } = require("../conversations/registry.js");

/** B"H: a pasted ChatGPT URL becomes a stable season vessel. */
function sessionIdFrom(input = {}) {
  const explicit = clean(input.sessionId || input.chatgptSessionId || input.aiSessionId);
  if (explicit) return safe(explicit);
  const id = conversationIdFrom(input);
  if (id) return `chatgpt_${safe(id)}`;
  return `chatgpt_session_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function conversationIdFrom(input = {}) {
  return clean(input.conversationId || idFromUrl(input.conversationUrl || input.url || input.chatgptUrl || ""));
}

function urlFrom(input = {}) {
  const url = clean(input.conversationUrl || input.chatgptUrl || input.url);
  if (url) return url;
  const id = conversationIdFrom(input);
  return id ? `https://chatgpt.com/c/${encodeURIComponent(id)}` : "https://chatgpt.com/";
}

function clean(value = "") { return String(value || "").trim(); }
function safe(value = "") { return clean(value).replace(/[^A-Za-z0-9_.-]+/g, "-").slice(0, 160) || "session"; }

module.exports = { clean, conversationIdFrom, safe, sessionIdFrom, urlFrom };
