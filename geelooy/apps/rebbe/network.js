//B"H
// network.js - Archive.org Interaction via index.json

const BASE_URL = 'https://archive.org/download';
const INDICES_BUCKET = 'awtsmoos-master-indices';
const AUDIO_EXTS = ['.mp3', '.opus', '.ogg', '.wav', '.m4a', '.flac'];

/**
 * Searches the Master Index Bucket by Date.
 * @param {string|number} monthId - 1-12
 * @param {string|number} day - 1-30
 */
export async function searchByDate(monthId, day) {
    // Strategy: Fetch the Day Index, then filter by Month client-side.
    // This is efficient because days have ~1/30th of total events.
    if (!day) throw new Error("Day is required for vector search.");
    
    const url = `${BASE_URL}/${INDICES_BUCKET}/days/${day}.json`;
    console.log(`[NET] SEARCH VECTOR: ${url}`);
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Index Not Found (404)");
        const json = await res.json();
        
        if (!json.events) return [];
        
        // Filter by month if provided
        let results = json.events;
        if (monthId) {
            results = results.filter(e => e.month_id == monthId);
        }
        
        return results;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function fetchYearFolders(yearId, logCallback) {
    const url = `${BASE_URL}/${yearId}/index.json`;
    logCallback(`NET: GET INDEX ${url}...`);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.contents || !Array.isArray(json.contents)) throw new Error("Invalid Index JSON format");

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

export async function fetchFolderTracks(yearId, folderName, logCallback) {
    const encodedPath = encodeURIComponent(folderName);
    const url = `${BASE_URL}/${yearId}/${encodedPath}/index.json`;
    logCallback(`NET: GET TRACKS ${folderName}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.contents || !Array.isArray(json.contents)) throw new Error("Invalid Folder Index JSON");

        const tracks = json.contents
            .filter(item => {
                if (item.type !== 'file') return false;
                const lower = item.name.toLowerCase();
                return AUDIO_EXTS.some(ext => lower.endsWith(ext));
            })
            .map(item => {
                let name = item.name;
                let urlName = item.name;
                if (name.toLowerCase().endsWith('.opus')) {
                    name = name.replace(/\.opus$/i, '.mp3');
                    urlName = name; 
                }
                return {
                    name: name,
                    path: `${folderName}/${name}`,
                    url: `${BASE_URL}/${yearId}/${encodedPath}/${encodeURIComponent(urlName)}`, 
                    size: item.size
                };
            });
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