// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { rememberConversation, idFromUrl } = require("./registry.js");

/** B"H: reads current ChatGPT URL/title and remembers the conversation id. */
async function readCurrentConversation(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const expression = `(() => ({ href: location.href, title: document.title, text: document.body?.innerText?.slice(0, 4000) || '' }))()`;
  const got = await chromeEval({ port, expression, timeoutMs: payload.timeoutMs || 15000, maxLogs: 20 });
  const value = got.result?.result?.value || got.result?.value || {};
  const conversationId = idFromUrl(value.href);
  const info = { conversationId, title: titleFrom(value), url: value.href || "", provider: "chatgpt-browser" };
  if (conversationId) await rememberConversation(info);
  return { ok: true, action: "chatgptCurrentConversation", ...info, detected: !!conversationId };
}

function titleFrom(value = {}) {
  const title = String(value.title || "").replace(/^ChatGPT\s*-?\s*/i, "").trim();
  return title || "ChatGPT conversation";
}

module.exports = { readCurrentConversation, titleFrom };
