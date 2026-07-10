// B"H
/** DeepSeek client with fatal classification, cancellation, and hard request timeout. */
export class DeepSeekError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'DeepSeekError';
    Object.assign(this, { status: null, code: null, retryable: false, fatal: false, responseText: '', ...options });
  }
}

function httpError(status, json, text) {
  const message = json?.error?.message || text || `HTTP ${status}`;
  const fatal = status === 401 || status === 402 || status === 403 || /insufficient balance/i.test(message);
  const retryable = status === 408 || status === 409 || status === 429 || status >= 500;
  return new DeepSeekError(`DeepSeek HTTP ${status}: ${text.slice(0, 1200)}`, {
    status, code: json?.error?.code || null, fatal, retryable, responseText: text
  });
}

function linkedSignal(parent, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('request_timeout')), timeoutMs);
  const onAbort = () => controller.abort(parent?.reason || new Error('parent_aborted'));
  if (parent) {
    if (parent.aborted) onAbort();
    else parent.addEventListener('abort', onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeout);
      if (parent) parent.removeEventListener('abort', onAbort);
    }
  };
}

export async function callDeepSeek({ prompt, model = 'deepseek-chat', signal, timeoutMs = 180000 }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new DeepSeekError('DEEPSEEK_API_KEY is not set', { code: 'missing_api_key', fatal: true });
  const body = { model, temperature: 0, messages: [{ role: 'user', content: prompt }] };
  const linked = linkedSignal(signal, timeoutMs);
  let response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body), signal: linked.signal
    });
  } catch (error) {
    if (signal?.aborted) throw new DeepSeekError('DeepSeek request aborted by swarm', { code: 'aborted' });
    if (linked.signal.aborted) throw new DeepSeekError(`DeepSeek request timed out after ${timeoutMs}ms`, {
      code: 'request_timeout', retryable: true
    });
    throw new DeepSeekError(`DeepSeek network error: ${error.message}`, { code: 'network_error', retryable: true });
  } finally {
    linked.cleanup();
  }
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!response.ok) throw httpError(response.status, json, text);
  const xml = json?.choices?.[0]?.message?.content || '';
  if (!xml.trim()) throw new DeepSeekError('DeepSeek returned an empty response', { code: 'empty_response', retryable: true });
  return { sanitizedRequest: { url: 'https://api.deepseek.com/chat/completions', body }, rawResponse: json || text, xml, usage: json?.usage || null };
}
