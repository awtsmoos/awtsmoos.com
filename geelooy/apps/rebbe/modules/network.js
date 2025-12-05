//B"H
// modules/network.js
import { YEARS } from './store.js';
import { searchArchive } from '../search.js';

export async function fetchIndex() {
    // Return the hardcoded years map as the index
    return YEARS;
}

export async function fetchYear(yearKey) {
    // Map simple year (e.g., "5711") to Archive ID
    const archiveId = YEARS[yearKey];
    if (!archiveId) throw new Error(`Year ${yearKey} not found in database`);
    return fetchYearFolders(archiveId);
}

export async function fetchFolder(yearKey, folderName) {
    const archiveId = YEARS[yearKey];
    if (!archiveId) throw new Error(`Year ${yearKey} not found`);
    return fetchFolderTracks(archiveId, folderName);
}

// Alias search to the external search module
export const search = searchArchive;

export async function fetchYearFolders(yearId, logFn) {
    // Construct Archive.org URL
    const url = `https://archive.org/metadata/${yearId}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const files = json.files;
        // Group by directory
        const folders = new Set();
        files.forEach(f => {
            const parts = f.name.split('/');
            if (parts.length > 1) folders.add(parts[0]);
        });
        return Array.from(folders).sort();
    } catch(e) {
        if(logFn) logFn(`NET ERROR: ${e.message}`, true);
        return [];
    }
}

export async function fetchFolderTracks(yearId, folderName, logFn) {
    const url = `https://archive.org/metadata/${yearId}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        // Filter by folder prefix and mp3 format
        // Ensure folderName is treated as a prefix correctly
        const files = json.files.filter(f => f.name.startsWith(folderName + '/') && f.format === 'VBR MP3');
        
        return files.map(f => {
            const rawName = f.name.split('/').pop().replace('.mp3', '');
            const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
            
            // Encode the path components properly
            // Archive.org structure: download/ID/Folder/File.mp3
            // We split by '/' to avoid encoding the directory separators
            const encodedPath = f.name.split('/').map(p => encodeURIComponent(p)).join('/');

            return {
                title: cleanName, // Normalized to 'title' to match UI expectation
                name: cleanName,
                duration: parseFloat(f.length || 0), // Archive.org length is seconds string
                path: `${yearId}/${f.name}`, // Unique ID for DB
                url: `https://archive.org/download/${yearId}/${encodedPath}`
            };
        }).sort((a,b) => a.title.localeCompare(b.title));
    } catch(e) {
        if(logFn) logFn(`NET ERROR: ${e.message}`, true);
        return [];
    }
}

export async function fetchBlob(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    return await res.blob();
}