// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { sendDirectChatGptMessage } = require("../direct/conversation.js");
const { sendBrowserConsoleChatGptMessage } = require("../direct/browserConsoleConversation.js");
const { readCurrentConversation } = require("../conversations/current.js");

const TRANSPORTS = {
  browser: sendBrowserConsoleChatGptMessage,
  browserConsole: sendBrowserConsoleChatGptMessage,
  console: sendBrowserConsoleChatGptMessage,
  chrome: sendBrowserConsoleChatGptMessage,
  direct: sendDirectChatGptMessage,
  node: sendDirectChatGptMessage,
  fetch: sendDirectChatGptMessage
};

/**
 * B"H
 * Chapter 425: Two Rivers Entered One Mouth.
 *
 * The Awtsmoos revealed two valid ways to speak: the Node river, which carries
 * cookies and prepared seals itself, and the Chrome-console river, where Node
 * prepares bearer/sentinel/body while the page performs the real fetch with its
 * own living browser credentials. The payload chooses the river; the caller gets
 * one stable result shape.
 *
 * @param {object} payload Message payload from the tunnel action dispatcher.
 * @returns {Promise<object>} ChatGPT message result.
 */
async function chatgptMessage(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const targetUrl = conversationUrl(payload) || payload.url || "https://chatgpt.com/";
  await ensureProfileChrome({ ...payload, port, url: targetUrl, navigate: false });
  const session = await sessionCheck({ ...payload, port });
  if (!session.session?.authenticated) return notAuthenticated(session);
  const sender = senderFor(payload);
  const response = await sender({ ...payload, port });
  const current = await readCurrentConversation({ ...payload, port }).catch(error => ({ ok: false, error: error.message }));
  return {
    ok: response.ok,
    action: "chatgptMessage",
    transport: response.transport || transportName(payload),
    port,
    sent: response.sent || null,
    response,
    conversation: current,
    text: response.text || ""
  };
}

function senderFor(payload = {}) {
  return TRANSPORTS[transportName(payload)] || sendDirectChatGptMessage;
}

function transportName(payload = {}) {
  return String(payload.transport || payload.mode || payload.sendVia || "direct").trim() || "direct";
}

function conversationUrl(payload = {}) {
  const id = payload.conversationId || payload.id;
  return id ? "https://chatgpt.com/c/" + encodeURIComponent(String(id)) : null;
}

function notAuthenticated(session) {
  return { ok: false, action: "chatgptMessage", error: "not_authenticated", loginRequired: true, loginUrl: "https://chatgpt.com/", session: session.session };
}

module.exports = { chatgptMessage, conversationUrl, senderFor, transportName };
