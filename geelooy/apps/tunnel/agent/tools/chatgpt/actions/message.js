// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { sendDirectChatGptMessage } = require("../direct/conversation.js");
const { sendBrowserConsoleChatGptMessage } = require("../direct/browserConsoleConversation.js");
const { readCurrentConversation } = require("../conversations/current.js");
const { sendPrompt } = require("../runtime/sendPrompt.js");
const { waitForResponse } = require("../runtime/waitForResponse.js");

const TRANSPORTS = {
  visible: sendVisibleUiMessage,
  legal: sendVisibleUiMessage,
  ui: sendVisibleUiMessage,
  textarea: sendVisibleUiMessage,
  browser: sendVisibleUiMessage,
  browserConsole: sendBrowserConsoleChatGptMessage,
  console: sendBrowserConsoleChatGptMessage,
  chrome: sendVisibleUiMessage,
  direct: sendDirectChatGptMessage,
  node: sendDirectChatGptMessage,
  fetch: sendDirectChatGptMessage
};

/**
 * B"H
 * Chapter 25: The default ChatGPT river returned to the visible doorway.
 *
 * The default path opens/reuses debug Chrome, focuses the real ChatGPT composer,
 * inserts text, clicks/submit through the UI, and reads the rendered response.
 * Direct backend-like transports remain available only when explicitly chosen.
 */
async function chatgptMessage(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const targetUrl = conversationUrl(payload) || payload.url || "https://chatgpt.com/";
  await ensureProfileChrome({ ...payload, port, url: targetUrl, navigate: true });
  const session = await sessionCheck({ ...payload, port }).catch(error => ({ ok: false, error: error.message, session: { authenticated: false } }));
  if (!session.session?.authenticated && transportName(payload) !== "visible") return notAuthenticated(session);
  const sender = senderFor(payload);
  const response = await sender({ ...payload, port, url: targetUrl });
  const current = await readCurrentConversation({ ...payload, port }).catch(error => ({ ok: false, error: error.message }));
  return { ok: response.ok !== false, action: "chatgptMessage", transport: response.transport || transportName(payload), port, sent: response.sent || null, response, conversation: current, text: response.text || "" };
}

async function sendVisibleUiMessage(payload = {}) {
  const prompt = await sendPrompt(payload);
  if (!prompt.ok) return { ok: false, transport: "visible-ui", error: prompt.error || "composer_send_failed", prompt };
  const waited = await waitForResponse(payload);
  return { ok: waited.ok !== false, transport: "visible-ui", sent: prompt.result || prompt, text: waited.text || "", wait: waited, legalMode: true, note: "Sent through visible ChatGPT browser UI; no hidden completion endpoint used." };
}

function senderFor(payload = {}) { return TRANSPORTS[transportName(payload)] || sendVisibleUiMessage; }
function transportName(payload = {}) { return String(payload.transport || payload.mode || payload.sendVia || "visible").trim() || "visible"; }
function conversationUrl(payload = {}) { const id = payload.conversationId || payload.id; return id ? "https://chatgpt.com/c/" + encodeURIComponent(String(id)) : null; }
function notAuthenticated(session) { return { ok: false, action: "chatgptMessage", error: "not_authenticated", loginRequired: true, loginUrl: "https://chatgpt.com/", session: session.session, guidance: "Open ChatGPT in the debug Chrome profile and sign in, then retry. Default sending uses the visible page composer." }; }

module.exports = { chatgptMessage, conversationUrl, senderFor, sendVisibleUiMessage, transportName };
