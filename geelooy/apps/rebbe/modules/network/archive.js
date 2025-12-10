//B"H
// modules/network/archive.js
import { fetchJSON } from './transport.js';

// Helper to detect audio files
function isAudioFile(name) {
    return /\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i.test(name);
}

// Helper to resolve the direct storage URL to avoid 302 redirect chains
// This is critical because hitting archive.org/download directly is causing 0.0.0.0 redirects
function getDirectBaseUrl(meta) {
    if (!meta || !meta.d1) return null;
    const server = meta.d1; // e.g., ia800102.us.archive.org
    const dir = meta.dir;   // e.g., /0/items/my-item-id
    return `https://${server}${dir}`;
}

export async function fetchYearFolders(yearId) {
    let meta;
    try {
        // 1. Fetch Metadata first to get direct server info
        // This is NOT a fallback. It is required to find the correct 'ia' server 
        // to avoid broken 302 redirects.
        meta = await fetchJSON(`https://archive.org/metadata/${yearId}`);
    } catch (e) {
        console.warn("[ARCHIVE] Metadata request failed", e);
        return [];
    }

    // 2. Try fetching index.json directly from the storage node
    try {
        const baseUrl = getDirectBaseUrl(meta);
        if (baseUrl) {
            const indexUrl = `${baseUrl}/index.json`;
            const index = await fetchJSON(indexUrl);
            
            if (index && index.contents) {
                return index.contents
                    .filter(f => f.type === 'directory')
                    .map(f => f.name)
                    .sort(); // Sorts folders (BH_001_..., BH_002_...) correctly
            }
        }
    } catch (e) {
        console.warn(`[ARCHIVE] Direct index.json fetch failed for ${yearId}, falling back to metadata files.`, e);
    }

    // 3. Fallback: Parse 'files' list from metadata
    const folders = new Set();
    if (meta.files) {
        meta.files.forEach(f => {
            const parts = f.name.split('/');
            if (parts.length > 1) folders.add(parts[0]);
        });
    }
    return Array.from(folders).sort();
}

export async function fetchFolderTracks(yearId, folderName) {
    let meta;
    try {
        meta = await fetchJSON(`https://archive.org/metadata/${yearId}`);
    } catch (e) {
        console.warn("[ARCHIVE] Metadata request failed", e);
        return [];
    }

    // 2. Try fetching index.json in the specific folder directory
    try {
        const baseUrl = getDirectBaseUrl(meta);
        if (baseUrl) {
            // Encode folder name for URL
            const indexUrl = `${baseUrl}/${encodeURIComponent(folderName)}/index.json`;
            const index = await fetchJSON(indexUrl);

            if (index && index.contents) {
                const rawTracks = index.contents
                    .filter(f => f.type === 'file' && isAudioFile(f.name))
                    .map(f => {
                        // Cleanup name for Display Title (remove extension and prefix)
                        const rawName = f.name.replace(/\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i, '');
                        const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
                        
                        // Force MP3 extension for download URL regardless of index extension
                        // (User states MP3s always exist even if index lists Opus)
                        const mp3FileName = rawName + ".mp3";
                        
                        // Construct direct download link using forced MP3 name
                        const fileUrl = `${baseUrl}/${encodeURIComponent(folderName)}/${encodeURIComponent(mp3FileName)}`;
                        
                        return {
                            title: cleanName,
                            name: cleanName,
                            duration: 0, // index.json usually lacks duration, player will update
                            path: `${yearId}/${folderName}/${mp3FileName}`, // Keep path with BH_ prefix for sorting
                            url: fileUrl
                        };
                    });

                // Deduplicate tracks (in case index lists both .opus and .mp3 for same file)
                const uniqueTracks = [];
                const seenTitles = new Set();
                for (const t of rawTracks) {
                    if (!seenTitles.has(t.title)) {
                        seenTitles.add(t.title);
                        uniqueTracks.push(t);
                    }
                }
                
                // SORT BY PATH (Filename) to ensure BH_001 comes before BH_002
                // Do NOT sort by title, as that destroys chronological order
                return uniqueTracks.sort((a, b) => a.path.localeCompare(b.path));
            }
        }
    } catch(e) {
        console.warn(`[ARCHIVE] Folder index.json failed for ${folderName}. Fallback to Metadata.`, e);
    }

    // 3. Fallback: Parse 'files' list from metadata
    if (meta.files) {
        return meta.files
            .filter(f => {
                return f.name.startsWith(folderName + '/') && isAudioFile(f.name);
            })
            .map(f => {
                const fileName = f.name.split('/').pop();
                const rawName = fileName.replace(/\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i, '');
                const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
                
                // For metadata fallback, use standard download URL logic
                const encodedPath = f.name.split('/').map(p => encodeURIComponent(p)).join('/');
                const dur = parseFloat(f.length || f.duration || 0);

                return {
                    title: cleanName,
                    name: cleanName,
                    duration: dur,
                    path: `${yearId}/${f.name}`,
                    url: `https://archive.org/download/${yearId}/${encodedPath}`
                };
            })
            .sort((a,b) => a.path.localeCompare(b.path)); // Sort by path here too
    }
    return [];
}