// B"H
const { CHATGPT_ORIGIN } = require("./auth.js");
const { F_CONVERSATION_PATH } = require("./conversation.js");

/**
 * B"H
 * Chapter 437: Prepare Was Given The Body It Secretly Wanted.
 *
 * The page accepted sentinel prepare, but `/f/conversation/prepare` answered
 * `Invalid conversation body` when called as an empty knock. The next garment
 * sends the same final turn body into the prepare gate, then sends the prepared
 * body through `/f/conversation` from inside the real Chrome tab.
 *
 * @param {object} input Browser request input.
 * @returns {string} CDP Runtime.evaluate expression.
 */
function browserPreparedFetchScript(input = {}) {
  return `(() => {
    const origin = ${JSON.stringify(CHATGPT_ORIGIN)};
    const bearer = ${JSON.stringify(`Bearer ${input.token || ""}`)};
    const finalBody = ${JSON.stringify(input.body || {})};
    const priorConduitToken = ${JSON.stringify(input.priorConduitToken || "")};
    const paths = {
      conversation: ${JSON.stringify(F_CONVERSATION_PATH)},
      conversationPrepare: ${JSON.stringify(`${F_CONVERSATION_PATH}/prepare`)},
      sentinelPrepare: "/backend-api/sentinel/chat-requirements/prepare",
      sentinelPing: "/backend-api/sentinel/ping",
      sentinelFinalize: "/backend-api/sentinel/chat-requirements/finalize"
    };
    const trace = { startedAt: new Date().toISOString(), href: location.href, stages: [], tokenLengths: {}, headerNames: [] };
    const uuid = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2);
    const clean = headers => Object.fromEntries(Object.entries(headers || {}).filter(([, value]) => value !== undefined && value !== null && String(value) !== ''));
    const stored = key => {
      try { return localStorage.getItem(key) || sessionStorage.getItem(key) || ''; } catch { return ''; }
    };
    const findStored = words => {
      for (const store of [localStorage, sessionStorage]) {
        try {
          for (let i = 0; i < store.length; i++) {
            const key = String(store.key(i) || '').toLowerCase();
            if (words.every(word => key.includes(word))) return store.getItem(store.key(i)) || '';
          }
        } catch {}
      }
      return '';
    };
    const clientHeaders = targetPath => clean({
      authorization: bearer,
      'content-type': 'application/json',
      'oai-client-build-number': findStored(['build']) || '7399582',
      'oai-client-version': findStored(['client', 'version']) || 'prod-59fdeee9467dea9ba2491a40d367655c322d74c2',
      'oai-device-id': stored('oai-device-id') || findStored(['device']) || uuid(),
      'oai-language': navigator.language || 'en-US',
      'oai-session-id': stored('oai-session-id') || findStored(['session']) || uuid(),
      'x-openai-target-path': targetPath,
      'x-openai-target-route': targetPath
    });
    const rememberToken = (name, value) => {
      if (value) trace.tokenLengths[name] = String(value).length;
      return value || '';
    };
    const postJson = async (path, headers, body = {}) => {
      const response = await fetch(origin + path, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(body) });
      const text = await response.clone().text().catch(() => '');
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch {}
      trace.stages.push({ path, ok: response.ok, status: response.status, keys: json && typeof json === 'object' ? Object.keys(json).sort() : [], textPreview: text.slice(0, 180), bodyKeys: body && typeof body === 'object' ? Object.keys(body).sort() : [] });
      return { response, json, text };
    };
    const ping = async prepared => {
      const headers = clean({
        ...clientHeaders(paths.sentinelPing),
        'content-type': '',
        'openai-sentinel-chat-requirements-prepare-token': prepared.prepareToken,
        'openai-sentinel-chat-requirements-token': prepared.requirementsToken,
        'openai-sentinel-proof-token': prepared.proofToken,
        'openai-sentinel-turnstile-token': prepared.turnstileToken,
        'openai-sentinel-so-token': prepared.soToken,
        'openai-sentinel-extra-data': prepared.extraData
      });
      const response = await fetch(origin + paths.sentinelPing, { method: 'POST', credentials: 'include', headers }).catch(error => ({ ok: false, status: 0, text: () => Promise.resolve(error.message) }));
      const text = await response.text().catch(() => '');
      trace.stages.push({ path: paths.sentinelPing, ok: response.ok, status: response.status, headerNames: Object.keys(headers).sort(), textPreview: text.slice(0, 180) });
    };
    const finalHeaders = prepared => clean({
      ...clientHeaders(paths.conversation),
      accept: 'text/event-stream',
      'x-oai-turn-trace-id': prepared.turnTraceId,
      'x-conduit-token': prepared.conduitToken,
      'openai-sentinel-chat-requirements-prepare-token': prepared.prepareToken,
      'openai-sentinel-chat-requirements-token': prepared.requirementsToken,
      'openai-sentinel-proof-token': prepared.proofToken,
      'openai-sentinel-turnstile-token': prepared.turnstileToken
    });
    return (async () => {
      const turnTraceId = uuid();
      const preparedBody = { ...finalBody, client_prepare_state: 'success' };
      const convoPrepare = await postJson(paths.conversationPrepare, clean({ ...clientHeaders(paths.conversationPrepare), 'x-oai-turn-trace-id': turnTraceId, 'x-conduit-token': priorConduitToken }), preparedBody);
      const sentinelPrepare = await postJson(paths.sentinelPrepare, clientHeaders(paths.sentinelPrepare));
      const prepared = {
        turnTraceId,
        conduitToken: rememberToken('conduitToken', convoPrepare.json && convoPrepare.json.conduit_token),
        prepareToken: rememberToken('prepareToken', sentinelPrepare.json && sentinelPrepare.json.prepare_token),
        requirementsToken: '',
        proofToken: '',
        turnstileToken: '',
        soToken: '',
        extraData: ''
      };
      await ping(prepared);
      const finalized = await postJson(paths.sentinelFinalize, clientHeaders(paths.sentinelFinalize));
      prepared.requirementsToken = rememberToken('finalizedRequirementsToken', finalized.json && finalized.json.token) || prepared.requirementsToken;
      await ping(prepared);
      const headers = finalHeaders(prepared);
      trace.headerNames = Object.keys(headers).sort();
      const response = await fetch(origin + paths.conversation, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(preparedBody) });
      const decoded = await decodeSse(response);
      trace.stages.push({ path: paths.conversation, ok: response.ok, status: response.status, events: decoded.events });
      return { ok: response.ok, status: response.status, statusText: response.statusText, url: response.url, ...decoded, trace };
    })().catch(error => ({ ok: false, error: error.message, stack: error.stack || '', trace }));
    async function decodeSse(response) {
      const reader = response.body && response.body.getReader ? response.body.getReader() : null;
      if (!reader) return { text: await response.text(), events: 0, conversationId: '', assistantMessageId: '' };
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      let events = 0;
      let conversationId = '';
      let assistantMessageId = '';
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        buffer += decoder.decode(next.value, { stream: true });
        const blocks = buffer.split('\\n\\n');
        buffer = blocks.pop() || '';
        for (const block of blocks) {
          const data = block.split('\\n').map(line => line.replace('\\r', '')).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\\n').trim();
          if (!data || data === '[DONE]') continue;
          let parsed = null;
          try { parsed = JSON.parse(data); } catch { continue; }
          events += 1;
          const message = parsed.message || parsed.data && parsed.data.message || null;
          const content = message && message.content || {};
          if (Array.isArray(content.parts)) text = content.parts.find(part => typeof part === 'string' && part.trim()) || text;
          if (typeof content.text === 'string') text = content.text;
          assistantMessageId = message && message.id || assistantMessageId;
          conversationId = parsed.conversation_id || parsed.conversationId || conversationId;
        }
      }
      return { text, events, conversationId, assistantMessageId };
    }
  })()`;
}

module.exports = { browserPreparedFetchScript };
