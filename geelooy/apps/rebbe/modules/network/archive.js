//B"H
// modules/network/archive.js
import { fetchJSON } from './transport.js';

const AUDIO_RE = /\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i;

function isAudioFile(name) {
    return AUDIO_RE.test(name || '');
}

function getDirectBaseUrl(meta) {
    if (!meta || !meta.d1 || !meta.dir) return null;
    return `https://${meta.d1}${meta.dir}`;
}

function strictEncode(part) {
    return encodeURIComponent(String(part))
        .replace(/[!'()*]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
}

function encodedParts(path) {
    return String(path).split('/').map(strictEncode).join('/');
}

function archiveDownloadBase(yearId) {
    return `https://archive.org/download/${strictEncode(yearId)}`;
}

function directUrl(meta, folderName, fileName) {
    const base = getDirectBaseUrl(meta);
    if (!base) return null;
    return `${base}/${strictEncode(folderName)}/${strictEncode(fileName)}`;
}

function downloadUrl(yearId, folderName, fileName) {
    return `${archiveDownloadBase(yearId)}/${strictEncode(folderName)}/${strictEncode(fileName)}`;
}

function uniqueUrls(urls) {
    return urls.filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i);
}

function cleanName(value) {
    return String(value || '')
        .replace(AUDIO_RE, '')
        .replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
        .replace(/_/g, ' ')
        .replace(/\s*-\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export { cleanName as cleanArchiveName };

export async function fetchYearFolders(yearId) {
    let meta;
    try {
        meta = await fetchJSON(`https://archive.org/metadata/${strictEncode(yearId)}`);
    } catch (e) {
        console.warn('[ARCHIVE] Metadata request failed', e);
    }

    let index = null;

    if (meta) {
        try {
            const baseUrl = getDirectBaseUrl(meta);
            if (baseUrl) index = await fetchJSON(`${baseUrl}/index.json`);
        } catch (e) {
            console.warn(`[ARCHIVE] Direct index.json fetch failed for ${yearId}.`, e);
        }
    }

    if (!index) {
        try {
            index = await fetchJSON(`${archiveDownloadBase(yearId)}/index.json`);
        } catch (e) {
            console.warn(`[ARCHIVE] Standard index.json fetch failed for ${yearId}.`, e);
        }
    }

    if (index && Array.isArray(index.contents)) {
        return index.contents
            .filter(f => f.type === 'directory')
            .map(f => f.name)
            .sort();
    }

    const folders = new Set();
    if (meta && Array.isArray(meta.files)) {
        meta.files.forEach(f => {
            const parts = String(f.name || '').split('/');
            if (parts.length > 1) folders.add(parts[0]);
        });
    }
    return Array.from(folders).sort();
}

export async function fetchFolderTracks(yearId, folderName) {
    let meta;
    try {
        meta = await fetchJSON(`https://archive.org/metadata/${strictEncode(yearId)}`);
    } catch (e) {
        console.warn('[ARCHIVE] Metadata request failed', e);
    }

    let index = null;

    if (meta) {
        try {
            const baseUrl = getDirectBaseUrl(meta);
            if (baseUrl) index = await fetchJSON(`${baseUrl}/${strictEncode(folderName)}/index.json`);
        } catch (e) {
            console.warn(`[ARCHIVE] Direct folder index failed for ${folderName}.`, e);
        }
    }

    if (!index) {
        try {
            index = await fetchJSON(`${archiveDownloadBase(yearId)}/${strictEncode(folderName)}/index.json`);
        } catch (e) {
            console.warn(`[ARCHIVE] Standard folder index failed for ${folderName}.`, e);
        }
    }

    if (index && Array.isArray(index.contents)) {
        return finalizeTracks(index.contents
            .filter(f => f.type === 'file' && isAudioFile(f.name))
            .map(f => makeTrack({ yearId, folderName, fileName: f.name, meta, duration: f.length || f.duration || 0 })));
    }

    if (meta && Array.isArray(meta.files)) {
        return finalizeTracks(meta.files
            .filter(f => String(f.name || '').startsWith(folderName + '/') && isAudioFile(f.name))
            .map(f => {
                const fileName = String(f.name).split('/').pop();
                return makeTrack({ yearId, folderName, fileName, meta, duration: f.length || f.duration || 0, pathName: f.name });
            }));
    }

    return [];
}

function makeTrack({ yearId, folderName, fileName, meta, duration, pathName }) {
    const standard = downloadUrl(yearId, folderName, fileName);
    const direct = directUrl(meta, folderName, fileName);

    return {
        title: cleanName(fileName),
        name: cleanName(fileName),
        duration: parseFloat(duration || 0),
        path: `${yearId}/${pathName || `${folderName}/${fileName}`}`,
        url: standard,
        fallbackUrls: uniqueUrls([
            standard,
            `https://archive.org/download/${yearId}/${encodedParts(pathName || `${folderName}/${fileName}`)}`,
            direct
        ])
    };
}

function finalizeTracks(rawTracks) {
    const uniqueTracks = [];
    const seen = new Set();

    for (const track of rawTracks) {
        const key = track.title.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTracks.push(track);
        }
    }

    return uniqueTracks.sort((a, b) => a.path.localeCompare(b.path));
}
