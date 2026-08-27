//B"H
// modules/player/transport.js
import { pState, init, resumeContext, setBuffer } from './core.js';
import * as Render from '../../render.js';

let currentUrl = null;
let lastTriedUrls = [];

export function setCallbacks(cbs) {
    pState.callbacks = { ...pState.callbacks, ...cbs };
    if (!pState.audioElement) init();
}

export async function playUrl(url, fallbackUrls = []) {
    if (!pState.audioElement) init();
    resumeContext();

    const urls = normalizeUrls(url, fallbackUrls);
    lastTriedUrls = urls;

    if (currentUrl && currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
    setBuffer(null);

    if (!urls.length) {
        Render.log('AUDIO ERROR: NO SOURCE URL', true);
        return false;
    }

    Render.setTracksLoading(true, 'CONNECTING STREAM');

    for (let i = 0; i < urls.length; i++) {
        const candidate = urls[i];
        try {
            currentUrl = candidate;
            await tryAudioSource(candidate);
            Render.setTracksLoading(false, '');
            return true;
        } catch (e) {
            console.warn(`[AUDIO] Source failed ${i + 1}/${urls.length}`, candidate, e);
            Render.log(`AUDIO SOURCE FAILED ${i + 1}/${urls.length}`, true);
        }
    }

    Render.setTracksLoading(false, 'ERROR');
    Render.log('AUDIO ERROR: ALL SOURCES FAILED. TRY DOWNLOAD OR CACHE.', true);
    return false;
}

function tryAudioSource(url) {
    return new Promise((resolve, reject) => {
        const audio = pState.audioElement;
        let settled = false;

        const cleanup = () => {
            audio.removeEventListener('canplay', onReady);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('error', onError);
            clearTimeout(timer);
        };

        const done = (fn, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            fn(value);
        };

        const onReady = () => {
            audio.play()
                .then(() => done(resolve, true))
                .catch(err => {
                    // Source is valid, but browser blocked autoplay. Keep the src; user can click Play.
                    if (err && err.name === 'NotAllowedError') {
                        Render.log('AUDIO LOADED: CLICK PLAY');
                        done(resolve, true);
                    } else {
                        done(reject, err);
                    }
                });
        };
        const onMeta = () => {
            if (audio.readyState >= 1) onReady();
        };
        const onError = () => done(reject, audio.error || new Error('Audio element failed to load source'));

        const timer = setTimeout(() => done(reject, new Error('Audio source timeout')), 15000);

        audio.pause();
        audio.removeAttribute('src');
        audio.load();

        audio.addEventListener('canplay', onReady, { once: true });
        audio.addEventListener('loadedmetadata', onMeta, { once: true });
        audio.addEventListener('error', onError, { once: true });

        // CRITICAL: do not set crossOrigin. Let HTML media do normal playback.
        audio.removeAttribute('crossorigin');
        audio.preload = 'auto';
        audio.src = url;
        audio.load();
    });
}

export async function playBlob(blob) {
    const url = URL.createObjectURL(blob);
    return playUrl(url);
}

export function togglePlay() {
    if (!pState.audioElement) return;
    if (pState.audioElement.paused) {
        resumeContext();
        pState.audioElement.play().catch(e => {
            console.error(e);
            Render.log('PLAYBCK BLOCKED: CLICK PLAY AGAIN', true);
        });
    } else {
        pState.audioElement.pause();
    }
}

export function seek(time) {
    if (!pState.audioElement) return;
    if (Number.isFinite(time)) pState.audioElement.currentTime = Math.max(0, time);
}

export function isPlaying() {
    return pState.audioElement ? !pState.audioElement.paused : false;
}

function normalizeUrls(url, fallbackUrls) {
    const raw = Array.isArray(url) ? url : [url, ...(Array.isArray(fallbackUrls) ? fallbackUrls : [])];
    return raw.filter(Boolean).filter((u, i, arr) => arr.indexOf(u) === i);
}

export const audioEl = {
    get currentTime() { return pState.audioElement ? pState.audioElement.currentTime : 0; },
    get duration() { return pState.audioElement ? (pState.audioElement.duration || 0) : 0; },
    get paused() { return pState.audioElement ? pState.audioElement.paused : true; },
    get src() { return pState.audioElement ? pState.audioElement.currentSrc : ''; },
    get attemptedSources() { return lastTriedUrls.slice(); }
};
