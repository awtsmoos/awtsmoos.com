//B"H
// modules/network/byte-loader.js
import { getAudioSources } from './audio-sources.js';

export async function fetchTrackBlob(track, options = {}) {
    const sources = getAudioSources(track);
    return await fetchFirstBlob(sources, options);
}

export async function fetchFirstBlob(sources, options = {}) {
    const urls = Array.isArray(sources) ? sources.filter(Boolean) : [sources].filter(Boolean);
    let lastError = null;

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                mode: 'cors',
                redirect: 'follow',
                signal: options.signal
            });

            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return await res.blob();
        } catch (e) {
            lastError = e;
            console.warn('[BYTES FAILED]', url, e);
        }
    }

    const err = new Error('CORS or network blocked all readable audio sources');
    err.cause = lastError;
    err.sources = urls;
    throw err;
}
