//B"H
// modules/network/transport.js
const MODE = 'cors';

export async function fetchBlob(urlOrUrls) {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    let lastError = null;

    for (const url of urls.filter(Boolean)) {
        try {
            const res = await fetch(url, { mode: MODE, redirect: 'follow' });
            if (!res.ok) throw new Error(`Transport Error ${res.status}: ${res.statusText}`);
            return await res.blob();
        } catch (e) {
            lastError = e;
            console.warn('[NETWORK] Blob fetch failed', url, e);
        }
    }

    const err = new Error('Transport Error: all blob sources failed');
    err.cause = lastError;
    throw err;
}

export async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Transport Error ${res.status}: ${res.statusText}`);
    return await res.json();
}
