// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { CHATGPT_ORIGIN } = require("./auth.js");

const PREPARE_PATHS = {
  conversation: "/backend-api/f/conversation/prepare",
  sentinelPrepare: "/backend-api/sentinel/chat-requirements/prepare",
  sentinelFinalize: "/backend-api/sentinel/chat-requirements/finalize"
};

/**
 * B"H
 * Chapter 426: The Gate Was Prepared Before The Word Crossed It.
 *
 * The traced click did not leap straight into `/f/conversation`. First it asked
 * the browser sanctuary for conduit and sentinel preparation. This helper runs
 * those same browser-side prepare knocks through debug Chrome, letting cookies
 * and forbidden browser garments remain inside the page where they belong.
 *
 * @param {object} input Prepare input.
 * @param {number} input.port Debug Chrome port.
 * @param {string} input.authorization Bearer header value.
 * @param {string} [input.priorConduitToken] Optional conduit token from cache.
 * @param {number} [input.timeoutMs] CDP timeout.
 * @returns {Promise<object>} Prepared browser tokens and client headers.
 */
async function prepareBrowserConversation(input = {}) {
  const expression = prepareScript({
    authorization: input.authorization || "",
    priorConduitToken: input.priorConduitToken || ""
  });
  const got = await chromeEval({
    port: Number(input.port || 9223),
    expression,
    timeoutMs: input.timeoutMs || 60000,
    maxLogs: 80
  });
  const value = got.result?.result?.value || got.result?.value || null;
  return { ok: Boolean(value?.ok), action: "chatgptBrowserPrepare", result: value, chromeOk: Boolean(got.ok) };
}

/**
 * B"H
 * Builds the browser-side preparation ritual as data, not guesswork. The page
 * gathers its own OAI client headers from local storage when possible, then
 * recreates the observed empty-body prepare POSTs.
 *
 * @param {object} input Script input.
 * @returns {string} Browser JavaScript expression.
 */
function prepareScript(input = {}) {
  return `(() => {
    const authorization = ${JSON.stringify(input.authorization || "")};
    const priorConduitToken = ${JSON.stringify(input.priorConduitToken || "")};
    const paths = ${JSON.stringify(PREPARE_PATHS)};
    const origin = ${JSON.stringify(CHATGPT_ORIGIN)};
    const uuid = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2);
    const readStorage = key => {
      try { return localStorage.getItem(key) || sessionStorage.getItem(key) || ''; }
      catch { return ''; }
    };
    const findStored = patterns => {
      for (const store of [localStorage, sessionStorage]) {
        try {
          for (let i = 0; i < store.length; i++) {
            const key = store.key(i) || '';
            if (patterns.some(pattern => pattern.test(key))) return store.getItem(key) || '';
          }
        } catch {}
      }
      return '';
    };
    const clientHeaders = targetPath => ({
      authorization,
      'content-type': 'application/json',
      'oai-client-build-number': findStored([/build.*number/i, /client.*build/i]) || '7399582',
      'oai-client-version': findStored([/client.*version/i, /build.*version/i]) || '',
      'oai-device-id': readStorage('oai-device-id') || findStored([/device.*id/i]) || uuid(),
      'oai-language': navigator.language || 'en-US',
      'oai-session-id': readStorage('oai-session-id') || findStored([/session.*id/i]) || uuid(),
      'x-openai-target-path': targetPath,
      'x-openai-target-route': targetPath
    });
    const postJson = async (path, headers) => {
      const response = await fetch(origin + path, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({})
      });
      const text = await response.clone().text().catch(() => '');
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch {}
      return { ok: response.ok, status: response.status, path, json, text };
    };
    return (async () => {
      const turnTraceId = uuid();
      const conversationHeaders = {
        ...clientHeaders(paths.conversation),
        'x-oai-turn-trace-id': turnTraceId
      };
      if (priorConduitToken) conversationHeaders['x-conduit-token'] = priorConduitToken;
      const conversation = await postJson(paths.conversation, conversationHeaders);
      const sentinelPrepare = await postJson(paths.sentinelPrepare, clientHeaders(paths.sentinelPrepare));
      const sentinelFinalize = await postJson(paths.sentinelFinalize, clientHeaders(paths.sentinelFinalize));
      return {
        ok: Boolean(conversation.ok || sentinelPrepare.ok || sentinelFinalize.ok),
        turnTraceId,
        clientHeaders: clientHeaders(paths.conversation),
        conversation: summarize(conversation),
        sentinelPrepare: summarize(sentinelPrepare),
        sentinelFinalize: summarize(sentinelFinalize),
        tokens: {
          conduitToken: conversation.json && conversation.json.conduit_token || '',
          prepareToken: sentinelPrepare.json && sentinelPrepare.json.prepare_token || '',
          finalizedToken: sentinelFinalize.json && sentinelFinalize.json.token || ''
        }
      };
    })();
    function summarize(value) {
      return {
        ok: Boolean(value && value.ok),
        status: value && value.status || 0,
        path: value && value.path || '',
        keys: value && value.json && typeof value.json === 'object' ? Object.keys(value.json).sort() : [],
        tokenLengths: tokenLengths(value && value.json || {})
      };
    }
    function tokenLengths(json) {
      const out = {};
      for (const [key, value] of Object.entries(json || {})) {
        if (/token/i.test(key)) out[key] = String(value || '').length;
      }
      return out;
    }
  })()`;
}

module.exports = { prepareBrowserConversation, prepareScript, PREPARE_PATHS };
