//B"H

/**
 * B"H — A tiny lantern for ChatGPT web requests.
 *
 * Logs exact request URL/method, redacted headers, response status, cookie count,
 * JSON keys, item counts, and a body preview. It also stores the last records on
 * `window.__awtsmoosChatGptDebug` so the console is not the only witness.
 */
export async function fetchJsonWithDiagnostics(fetcher, url, options = {}, context = {}) {
  const startedAt = Date.now();
  const method = options.method || "GET";
  const requestSummary = {
    url: String(url),
    method,
    headers: redactHeaders(options.headers || {}),
    transport: describeTransport(fetcher),
    context
  };

  console.groupCollapsed(`B"H ChatGPT request: ${context.label || "chatgpt-fetch"}`);
  console.log("B\"H ChatGPT request JSON", JSON.stringify(requestSummary));

  let response;
  try {
    response = await fetcher(url, {
      ...options,
      method,
      credentials: options.credentials || "include",
      cache: options.cache || "no-store"
    });
  } catch (error) {
    const failure = { ...requestSummary, message: error?.message || String(error) };
    console.error("B\"H ChatGPT network error JSON", JSON.stringify(failure));
    console.groupEnd();
    throw error;
  }

  const text = await safeText(response);
  const parsed = parseJson(text);
  const responseSummary = summarizeResponse(response, text, parsed, Date.now() - startedAt);
  const record = {
    label: context.label || "chatgpt-fetch",
    request: requestSummary,
    response: responseSummary,
    bodyPreview: text.slice(0, 1200)
  };

  pushDebugRecord(record);
  console.log("B\"H ChatGPT response JSON", JSON.stringify(responseSummary));
  console.log("B\"H ChatGPT body preview", record.bodyPreview);
  console.groupEnd();

  if (!response.ok) {
    const error = new Error(`ChatGPT request failed: ${response.status} ${response.statusText || ""}`.trim());
    error.responseBody = text;
    error.responseSummary = responseSummary;
    throw error;
  }
  if (!parsed.ok) {
    const error = new Error(`ChatGPT response was not JSON: ${parsed.error}`);
    error.responseBody = text;
    error.responseSummary = responseSummary;
    throw error;
  }

  attachDebug(parsed.value, responseSummary);
  return parsed.value;
}

/**
 * Reads auth/session in a redacted way and logs exactly what shape came back.
 */
export async function readSessionSummary(fetcher) {
  const result = await fetchJsonWithDiagnostics(
    fetcher,
    "https://chatgpt.com/api/auth/session",
    { method: "GET" },
    { label: "auth-session" }
  );
  const summary = {
    signedIn: Boolean(result?.user || result?.accessToken || result?.token || result?.access_token),
    keys: result && typeof result === "object" ? Object.keys(result).filter(key => !/token|email|id/i.test(key)) : [],
    warningOnly: Boolean(result?.WARNING_BANNER && Object.keys(result || {}).length === 1)
  };
  console.log("B\"H ChatGPT redacted session summary JSON", JSON.stringify(summary));
  return summary;
}

export function attachDebug(value, summary) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.defineProperty(value, "awtsmoosDebug", {
      value: summary,
      enumerable: false,
      configurable: true
    });
  }
}

async function safeText(response) {
  try { return await response.text(); }
  catch (error) { return `[[body read failed: ${error?.message || error}]]`; }
}

function parseJson(text) {
  try { return { ok: true, value: JSON.parse(text) }; }
  catch (error) { return { ok: false, error: error?.message || String(error) }; }
}

function pushDebugRecord(record) {
  globalThis.__awtsmoosChatGptDebug = globalThis.__awtsmoosChatGptDebug || [];
  globalThis.__awtsmoosChatGptDebug.push({ ...record, at: new Date().toISOString() });
  globalThis.__awtsmoosChatGptDebug = globalThis.__awtsmoosChatGptDebug.slice(-30);
}

function summarizeResponse(response, text, parsed, elapsedMs) {
  const value = parsed.ok ? parsed.value : null;
  return {
    status: response.status,
    ok: response.ok,
    url: response.url,
    redirected: response.redirected,
    elapsedMs,
    cookieCount: response.cookies?.count ?? null,
    bodyChars: text.length,
    json: parsed.ok,
    keys: value && typeof value === "object" ? Object.keys(value) : [],
    itemCount: Array.isArray(value?.items) ? value.items.length : null,
    total: typeof value?.total === "number" ? value.total : null
  };
}

function redactHeaders(headers) {
  const raw = headers instanceof Headers ? Object.fromEntries(headers.entries()) : { ...(headers || {}) };
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [
    key,
    /authorization|cookie|token/i.test(key) ? "[[redacted]]" : value
  ]));
}

function describeTransport(fetcher) {
  if (fetcher?.__awtsmoosServerBridge) return "Awtsmoos Chrome Server Extension";
  return typeof fetcher;
}
