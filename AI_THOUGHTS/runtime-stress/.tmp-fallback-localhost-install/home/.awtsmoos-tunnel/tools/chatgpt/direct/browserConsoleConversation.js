// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { directAuth } = require("./auth.js");
const { messageId } = require("./ids.js");
const { parentFor, getConversation, verifyAdvance } = require("./conversation.js");
const { legacyConversationBody, summarizeLegacyRequest } = require("./legacyRequest.js");
const { browserPreparedFetchScript } = require("./browserInjectedRequest.js");

/**
 * B"H
 * Chapter 435: Node Became The Scribe, Chrome Became The Mouth.
 *
 * This transport does not call ChatGPT from Node. Node only gathers the bearer
 * and parent id, writes the request body, and injects a complete browser spell
 * into debug Chrome. All prepare/final request traffic is born inside the
 * ChatGPT page.
 */
async function sendBrowserConsoleChatGptMessage(payload = {}) {
  const message = String(payload.message || payload.prompt || payload.text || "");
  if (!message) return { ok: false, action: "chatgptBrowserConsoleMessage", error: "missing_message" };
  const port = Number(payload.port || payload.chromePort || 9223);
  const auth = await directAuth({ ...payload, port });
  if (!auth.authenticated || !auth.token) return notAuthenticated(auth);
  const parent = await parentFor(payload, auth);
  const userMessageId = messageId();
  const prepared = { ok: true, conversation: { ok: true }, tokens: { conduitToken: "browser-prepared" } };
  const body = legacyConversationBody({ payload, message, parentMessageId: parent.parentMessageId, userMessageId, prepared });
  const browser = await runBrowserPreparedFetch({ port, token: auth.token, body, timeoutMs: payload.timeoutMs, priorConduitToken: payload.conduitToken || "" });
  const stream = browser.result || {};
  const proof = await verifyBrowserSend({ payload, auth, parent, userMessageId, stream });
  const ok = Boolean(browser.ok && stream.ok && proof.ok);
  return {
    ok,
    action: "chatgptBrowserConsoleMessage",
    transport: "chrome-page-fetch",
    port,
    session: auth.session,
    parent,
    sent: sentSummary({ body, browser, userMessageId }),
    response: { ...stream, proof },
    text: proof.text || stream.text || ""
  };
}

function notAuthenticated(auth) {
  return { ok: false, action: "chatgptBrowserConsoleMessage", error: "not_authenticated", loginRequired: true, session: auth.session };
}

async function runBrowserPreparedFetch({ port, token, body, timeoutMs, priorConduitToken }) {
  const expression = browserPreparedFetchScript({ token, body, priorConduitToken });
  const got = await chromeEval({ port, expression, timeoutMs: timeoutMs || 90000, maxLogs: 120 });
  const value = got.result?.result?.value || got.result?.value || null;
  return { ok: Boolean(value?.ok), action: "chatgptBrowserPreparedFetch", result: value, chrome: summarizeChromeEval(got) };
}

async function verifyBrowserSend({ payload, auth, parent, userMessageId, stream }) {
  const conversationId = stream.conversationId || parent.conversationId || payload.conversationId || "";
  if (!conversationId) return { ok: Boolean(stream.text), reason: "missing_conversation_id", text: stream.text || "" };
  let best = { ok: false, conversationId, text: stream.text || "" };
  const polls = Number(payload.verifyPolls ?? 12);
  for (let i = 0; i < polls; i++) {
    const convo = await getConversation(conversationId, auth).catch(() => null);
    const proof = verifyAdvance({ convo, parentNodeId: parent.parentMessageId || "", userMessageId, fallbackText: best.text });
    if (proof.text && proof.text.length >= String(best.text || "").length) best = proof;
    if (proof.ok) return proof;
    await sleep(500 + Math.min(i, 10) * 250);
  }
  return best;
}

function sentSummary({ body, browser, userMessageId }) {
  const trace = browser.result?.trace || {};
  return { userMessageId, trace, observedFormat: summarizeLegacyRequest({}, body), browserHeaderNames: trace.headerNames || [] };
}
function summarizeChromeEval(got = {}) { return { ok: Boolean(got.ok), exception: got.result?.exceptionDetails?.text || "", logs: got.logs || [] }; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = { sendBrowserConsoleChatGptMessage, browserPreparedFetchScript };
