// B"H
/**
 * @module SocialClient
 * @description
 * Chapter 87: Every endpoint receives a blade of verification.
 * The client carries GET, POST, PUT, and DELETE as separate vessels so each
 * API action can be tested by method, path, body, status, and envelope.
 */
export function createSocialClient(options = {}) {
    const base = options.base || '/api/social';
    const fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
    if (!fetcher) throw new Error('B"H fetcher is required for social client.');
    return {
        get: path => request(fetcher, base, path),
        post: (path, body) => request(fetcher, base, path, { method: 'POST', body }),
        put: (path, body) => request(fetcher, base, path, { method: 'PUT', body }),
        delete: path => request(fetcher, base, path, { method: 'DELETE' })
    };
}

async function request(fetcher, base, path, options = {}) {
    const response = await fetcher(base + path, buildOptions(options));
    const payload = await readPayload(response);
    if (!response.ok) return failure(response, payload);
    if (payload && typeof payload === 'object' && 'ok' in payload) return payload;
    return { ok: true, data: payload, error: null, meta: { status: response.status } };
}

function failure(response, payload) {
    return {
        ok: false,
        data: null,
        error: payload?.error || response.statusText || 'Request failed',
        meta: { status: response.status }
    };
}

function buildOptions(options) {
    if (!options.body) return options;
    const body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    return { ...options, body, headers: { 'content-type': 'application/json', ...(options.headers || {}) } };
}

async function readPayload(response) {
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
}
