//B"H
// modules/network/archive.js
import { fetchJSON } from './transport.js';

// Helper to detect audio files
function isAudioFile(name) {
    return /\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i.test(name);
}

// Helper to resolve the direct storage URL to avoid 302 redirect chains
function getDirectBaseUrl(meta) {
    if (!meta || !meta.d1) return null;
    const server = meta.d1; // e.g., ia800102.us.archive.org
    const dir = meta.dir;   // e.g., /0/items/my-item-id
    return `https://${server}${dir}`;
}

export async function fetchYearFolders(yearId) {
    let meta;
    try {
        meta = await fetchJSON(`https://archive.org/metadata/${yearId}`);
    } catch (e) {
        console.warn("[ARCHIVE] Metadata request failed", e);
        // If metadata fails, we can try blind fetching standard index
    }

    // Attempt to fetch index.json via multiple strategies
    let index = null;

    // Strategy 1: Direct Node (Best Performance, avoids redirect loops)
    if (meta) {
        try {
            const baseUrl = getDirectBaseUrl(meta);
            if (baseUrl) {
                index = await fetchJSON(`${baseUrl}/index.json`);
            }
        } catch (e) {
            console.warn(`[ARCHIVE] Direct index.json fetch failed for ${yearId}.`, e);
        }
    }

    // Strategy 2: Standard URL (Reliable, handles redirects if node is down)
    if (!index) {
        try {
            // Note: This might trigger 0.0.0.0 redirect issue on some networks/items,
            // but it's a necessary fallback if direct node IP logic failed.
            index = await fetchJSON(`https://archive.org/download/${yearId}/index.json`);
        } catch (e) {
            console.warn(`[ARCHIVE] Standard index.json fetch failed for ${yearId}.`, e);
        }
    }

    // Process Index
    if (index && index.contents) {
        return index.contents
            .filter(f => f.type === 'directory')
            .map(f => f.name)
            .sort(); 
    }

    // Strategy 3: Fallback to Metadata 'files' list
    // This is slowest/least accurate for folders but works if index.json is missing
    const folders = new Set();
    if (meta && meta.files) {
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
    }

    let index = null;
    let baseUrl = null;

    // Strategy 1: Direct Node Folder Index
    if (meta) {
        try {
            baseUrl = getDirectBaseUrl(meta);
            if (baseUrl) {
                const url = `${baseUrl}/${encodeURIComponent(folderName)}/index.json`;
                index = await fetchJSON(url);
            }
        } catch (e) {
            console.warn(`[ARCHIVE] Direct folder index failed for ${folderName}.`, e);
        }
    }

    // Strategy 2: Standard URL Folder Index
    if (!index) {
        try {
            // Recalculate base if needed, but for standard we just use download path
            const url = `https://archive.org/download/${yearId}/${encodeURIComponent(folderName)}/index.json`;
            index = await fetchJSON(url);
            
            // If we succeeded here, we need a baseUrl for the tracks
            // If direct base failed, we use standard download base
            if (!baseUrl) baseUrl = `https://archive.org/download/${yearId}`;
        } catch(e) {
            console.warn(`[ARCHIVE] Standard folder index failed for ${folderName}.`, e);
        }
    }

    if (index && index.contents) {
        // Use the baseUrl we established (Direct or Standard)
        // If we got index via Standard but have a Direct Base, we prefer Direct Base for file downloads
        // unless Direct Base was proven bad.
        // For simplicity, if Direct Base exists (from meta), use it. Else standard.
        const downloadBase = (meta && getDirectBaseUrl(meta)) || `https://archive.org/download/${yearId}`;

        const rawTracks = index.contents
            .filter(f => f.type === 'file' && isAudioFile(f.name))
            .map(f => {
                const rawName = f.name.replace(/\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i, '');
                const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
                const mp3FileName = rawName + ".mp3";
                
                return {
                    title: cleanName,
                    name: cleanName,
                    duration: 0, 
                    path: `${yearId}/${folderName}/${mp3FileName}`, 
                    url: `${downloadBase}/${encodeURIComponent(folderName)}/${encodeURIComponent(mp3FileName)}`
                };
            });

        // Deduplicate
        const uniqueTracks = [];
        const seenTitles = new Set();
        for (const t of rawTracks) {
            if (!seenTitles.has(t.title)) {
                seenTitles.add(t.title);
                uniqueTracks.push(t);
            }
        }
        return uniqueTracks.sort((a, b) => a.path.localeCompare(b.path));
    }

    // Strategy 3: Metadata Fallback
    if (meta && meta.files) {
        return meta.files
            .filter(f => {
                return f.name.startsWith(folderName + '/') && isAudioFile(f.name);
            })
            .map(f => {
                const fileName = f.name.split('/').pop();
                const rawName = fileName.replace(/\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i, '');
                const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
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
            .sort((a,b) => a.path.localeCompare(b.path)); 
    }
    return [];
}