//B"H
// modules/network/archive.js
import { fetchJSON } from './transport.js';

export async function fetchYearFolders(yearId) {
    const url = `https://archive.org/metadata/${yearId}`;
    try {
        const json = await fetchJSON(url);
        const files = json.files;
        const folders = new Set();
        files.forEach(f => {
            const parts = f.name.split('/');
            if (parts.length > 1) folders.add(parts[0]);
        });
        return Array.from(folders).sort();
    } catch(e) {
        console.warn(`NET WARN: ${e.message}`);
        return [];
    }
}

export async function fetchFolderTracks(yearId, folderName) {
    const url = `https://archive.org/metadata/${yearId}`;
    try {
        const json = await fetchJSON(url);
        // Filter by folder prefix and mp3 format
        const files = json.files.filter(f => f.name.startsWith(folderName + '/') && f.format === 'VBR MP3');
        
        return files.map(f => {
            const rawName = f.name.split('/').pop().replace('.mp3', '');
            const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
            
            // Encode path parts individually to match Archive.org server expectations
            const encodedPath = f.name.split('/').map(p => encodeURIComponent(p)).join('/');

            return {
                title: cleanName,
                name: cleanName,
                duration: parseFloat(f.length || 0),
                path: `${yearId}/${f.name}`,
                url: `https://archive.org/download/${yearId}/${encodedPath}`
            };
        }).sort((a,b) => a.title.localeCompare(b.title));
    } catch(e) {
        console.warn(`NET WARN: ${e.message}`);
        return [];
    }
}