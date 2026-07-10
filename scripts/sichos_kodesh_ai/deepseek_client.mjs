// B"H
/** Typed DeepSeek client with retry and fatal-error metadata. */
export class DeepSeekError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'DeepSeekError';
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.retryable = Boolean(options.retryable);
    this.fatal = Boolean(options.fatal);
    this.responseText = options.responseText || '';
  }
}

function classifyHttpError(status, json, responseText) {
  const code = json?.error?.code || null;
  const message = json?.error?.message || responseText || `HTTP ${status}`;
  const balance = status === 402 || /insufficient balance/i.test(message);
  const auth = status === 401 || status === 403;
  const retryable = status === 408 || status === 409 || status === 429 || status >= 500;
  return new DeepSeekError(`DeepSeek HTTP ${status}: ${responseText.slice(0, 1200)}`, {
    status,
    code,
    retryable,
    fatal: balance || auth,
    responseText
  });
}

export async function callDeepSeek({ prompt, model = 'deepseek-chat' }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new DeepSeekError('DEEPSEEK_API_KEY is not set', {
      code: 'missing_api_key',
      fatal: true
    });
  }

  const requestBody = {
    model,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }]
  };

  let response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    throw new DeepSeekError(`DeepSeek network error: ${error.message}`, {
      code: 'network_error',
      retryable: true
    });
  }

  const responseText = await response.text();
  let json = null;
  try {
    json = JSON.parse(responseText);
  } catch {}

  if (!response.ok) throw classifyHttpError(response.status, json, responseText);

  const xml = json?.choices?.[0]?.message?.content || '';
  if (!xml.trim()) {
    throw new DeepSeekError('DeepSeek returned an empty response', {
      code: 'empty_response',
      retryable: true
    });
  }

  return {
    sanitizedRequest: {
      url: 'https://api.deepseek.com/chat/completions',
      body: requestBody
    },
    rawResponse: json || responseText,
    xml,
    usage: json?.usage || null
  };
}
