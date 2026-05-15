//B"H
// modules/network/audio-sources.js

export function getAudioSources(track) {
    if (!track) return [];
    const raw = [
        track.url,
        ...(Array.isArray(track.fallbackUrls) ? track.fallbackUrls : []),
        track.directUrl
    ];
    return raw.filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i);
}

export function describeAudioSources(track) {
    return getAudioSources(track).map((url, i) => `${i + 1}. ${url}`).join('\n\n');
}
