// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { sendDirectChatGptMessage } = require("../direct/conversation.js");
const { readCurrentConversation } = require("../conversations/current.js");

/**
 * B"H
 * Chapter 406: The Browser Stopped Pretending To Be The Mouth.
 *
 * The Awtsmoos carved a cleaner channel through the code: Chrome opens only as
 * the login sanctuary, holding the user's living ChatGPT profile. After that,
 * Node takes the prompt into its own hands, gathers cookies and bearer session,
 * posts to `/backend-api/conversation`, and drinks the SSE river directly.
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
  const response = await sendDirectChatGptMessage({ ...payload, port });
  const current = await readCurrentConversation({ ...payload, port }).catch(error => ({ ok: false, error: error.message }));
  return { ok: response.ok, action: "chatgptMessage", transport: "node-fetch", port, sent: response.sent || null, response, conversation: current, text: response.text || "" };
}

function conversationUrl(payload = {}) {
  const id = payload.conversationId || payload.id;
  return id ? "https://chatgpt.com/c/" + encodeURIComponent(String(id)) : null;
}

function notAuthenticated(session) {
  return { ok: false, action: "chatgptMessage", error: "not_authenticated", loginRequired: true, loginUrl: "https://chatgpt.com/", session: session.session };
}

module.exports = { chatgptMessage, conversationUrl };
