// B"H
/**
 * @file QuotaAdapters.js
 * @description Provider-native quota probes and header normalization.
 */

const COMMON_HEADERS = [
    'x-ratelimit-limit-requests',
    'x-ratelimit-remaining-requests',
    'x-ratelimit-reset-requests',
    'x-ratelimit-limit-tokens',
    'x-ratelimit-remaining-tokens',
    'x-ratelimit-reset-tokens',
    'ratelimit-limit',
    'ratelimit-remaining',
    'ratelimit-reset'
];

function parseHeaders(headers) {
    const result = {};
    for (const key of COMMON_HEADERS) {
        const value = headers.get(key);
        if (value != null) result[key] = value;
    }
    return result;
}

function spec(provider, url, headerName = 'Authorization') {
    return { provider, url, headerName };
}

export const QuotaAdapters = {
    specs: {
        openai: spec('openai', 'https://api.openai.com/v1/models'),
        openrouter: spec('openrouter', 'https://openrouter.ai/api/v1/models'),
        groq: spec('groq', 'https://api.groq.com/openai/v1/models'),
        together: spec('together', 'https://api.together.xyz/v1/models'),
        xai: spec('xai', 'https://api.x.ai/v1/models'),
        cerebras: spec('cerebras', 'https://api.cerebras.ai/v1/models'),
        google: spec('google', 'https://generativelanguage.googleapis.com/v1beta/models')
    },

    async probe(providerId, apiKey) {
        const adapter = this.specs[providerId];
        if (!adapter || !apiKey) return { provider: providerId, status: 'missing' };
        const url = providerId === 'google'
            ? `${adapter.url}?key=${encodeURIComponent(apiKey)}`
            : adapter.url;
        const headers = providerId === 'google'
            ? {}
            : { [adapter.headerName]: `Bearer ${apiKey}` };
        try {
            const response = await fetch(url, { method: 'GET', headers });
            return {
                provider: providerId,
                statusCode: response.status,
                ok: response.ok,
                headers: parseHeaders(response.headers),
                polledAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                provider: providerId,
                ok: false,
                statusCode: 0,
                error: error.message || String(error),
                polledAt: new Date().toISOString()
            };
        }
    }
};
