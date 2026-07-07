// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { sendDirectChatGptMessage } = require("../direct/conversation.js");
const { sendBrowserConsoleChatGptMessage } = require("../direct/browserConsoleConversation.js");
const { readCurrentConversation } = require("../conversations/current.js");
const { sendPrompt } = require("../runtime/sendPrompt.js");
const { waitForResponse } = require("../runtime/waitForResponse.js");
const Defaults = require("../continuation/defaults.js");
const Compact = require("../continuation/compact.js");

const TRANSPORTS = { visible: sendVisibleUiMessage, legal: sendVisibleUiMessage, ui: sendVisibleUiMessage, textarea: sendVisibleUiMessage, browser: sendVisibleUiMessage, browserConsole: sendBrowserConsoleChatGptMessage, console: sendBrowserConsoleChatGptMessage, chrome: sendVisibleUiMessage, direct: sendDirectChatGptMessage, node: sendDirectChatGptMessage, fetch: sendDirectChatGptMessage };

/**
 * B"H
 * Chapter 25: The visible doorway learned not to hold the gateway hostage.
 * The caller may ask for a full response, but continuation mode submits quickly
 * and lets the next short tick detect the finished assistant message.
 */
async function chatgptMessage(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const targetUrl = conversationUrl(payload) || payload.url || "https://chatgpt.com/";
  await ensureProfileChrome({ ...payload, port, url: targetUrl, navigate: true });
  const session = await sessionCheck({ ...payload, port }).catch(error => ({ ok: false, error: error.message, session: { authenticated: false } }));
  if (!session.session?.authenticated && transportName(payload) !== "visible") return notAuthenticated(session);
  const response = await senderFor(payload)({ ...payload, port, url: targetUrl });
  const current = await readCurrentConversation({ ...payload, port }).catch(error => ({ ok: false, error: error.message }));
  const out = { ok: response.ok !== false, action: "chatgptMessage", transport: response.transport || transportName(payload), port, sent: response.sent || response.prompt?.result || null, response: compactResponse(response), conversation: current, text: response.text || "" };
  return payload.compact === false ? { ...out, response } : out;
}

async function sendVisibleUiMessage(payload = {}) {
  const prompt = await sendPrompt(payload);
  if (!prompt.ok) return { ok: false, transport: "visible-ui", error: prompt.error || "composer_send_failed", prompt };
  if (payload.awaitResponse === false || payload.shortCycle === true) return { ok:true, transport:"visible-ui", submitted:true, sent:prompt.result || prompt, text:"", wait:null, legalMode:true, next:"Call chatgptSessionContinue again; it will wait until the assistant is idle before sending the next prompt." };
  const waited = await waitForResponse({ ...payload, timeoutMs:Defaults.shortTimeout(payload.timeoutMs), settleMs:Defaults.settleMs(payload.settleMs) });
  return { ok: waited.ok !== false, transport: "visible-ui", sent: prompt.result || prompt, text: waited.text || "", wait: waited, legalMode: true, note: "Sent through visible ChatGPT browser UI; no hidden completion endpoint used." };
}

function compactResponse(response = {}) {
  return { ok:response.ok !== false, transport:response.transport, submitted:response.submitted, text:Compact.shorten(response.text || ""), wait:response.wait ? { ok:response.wait.ok, idle:response.wait.idle, durationMs:response.wait.durationMs, stableMs:response.wait.stableMs, error:response.wait.error || "" } : null, error:response.error || "" };
}
function senderFor(payload = {}) { return TRANSPORTS[transportName(payload)] || sendVisibleUiMessage; }
function transportName(payload = {}) { return String(payload.transport || payload.mode || payload.sendVia || "visible").trim() || "visible"; }
function conversationUrl(payload = {}) { const id = payload.conversationId || payload.id; return id ? "https://chatgpt.com/c/" + encodeURIComponent(String(id)) : null; }
function notAuthenticated(session) { return { ok: false, action: "chatgptMessage", error: "not_authenticated", loginRequired: true, loginUrl: "https://chatgpt.com/", session: session.session, guidance: "Open ChatGPT in the debug Chrome profile and sign in, then retry. Default sending uses the visible page composer." }; }
module.exports = { chatgptMessage, conversationUrl, senderFor, sendVisibleUiMessage, transportName, compactResponse };
