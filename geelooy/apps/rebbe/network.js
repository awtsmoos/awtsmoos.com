//B"H
// network.js - Archive.org Interaction via index.json

const BASE_URL = 'https://archive.org/download';
const AUDIO_EXTS = ['.mp3', '.opus', '.ogg', '.wav', '.m4a', '.flac'];

/**
 * Fetches the root index.json for a Year (Identifier) to get sub-folders.
 */
export async function fetchYearFolders(yearId, logCallback) {
    const url = `${BASE_URL}/${yearId}/index.json`;
    logCallback(`NET: GET INDEX ${url}...`);
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        if (!json.contents || !Array.isArray(json.contents)) {
            throw new Error("Invalid Index JSON format");
        }

        // Filter for directories
        const folders = json.contents
            .filter(item => item.type === 'directory')
            .map(item => item.name);

        logCallback(`NET: OK. Found ${folders.length} folders.`);
        return folders;
        
    } catch (e) {
        logCallback(`NET ERROR: ${e.message}`, true);
        throw e;
    }
}

/**
 * Fetches the index.json for a specific sub-folder to get audio tracks.
 */
export async function fetchFolderTracks(yearId, folderName, logCallback) {
    // Encode the folder name for the URL, but keep it readable for the user logs
    const encodedPath = encodeURIComponent(folderName);
    const url = `${BASE_URL}/${yearId}/${encodedPath}/index.json`;
    
    logCallback(`NET: GET TRACKS ${folderName}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json.contents || !Array.isArray(json.contents)) {
            throw new Error("Invalid Folder Index JSON");
        }

        // Filter for audio files
        const tracks = json.contents
            .filter(item => {
                if (item.type !== 'file') return false;
                const lower = item.name.toLowerCase();
                return AUDIO_EXTS.some(ext => lower.endsWith(ext));
            })
            .map(item => ({
                name: item.name,
                path: `${folderName}/${item.name}`, // Logical path for DB key
                url: `${BASE_URL}/${yearId}/${encodedPath}/${encodeURIComponent(item.name)}`, // Full Download URL
                size: item.size
            }));

        logCallback(`NET: OK. Found ${tracks.length} tracks.`);
        return tracks;

    } catch (e) {
        logCallback(`NET ERROR: ${e.message}`, true);
        throw e;
    }
}

export async function fetchBlob(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download Failed");
    return await res.blob();
}