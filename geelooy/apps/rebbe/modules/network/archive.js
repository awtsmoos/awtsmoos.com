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
        
        // FIX: relaxed filter. Archive.org sometimes labels .mp3 files as "Opus" or "VBR MP3"
        // We now filter by checking if it starts with the folder name AND ends with .mp3
        const files = json.files.filter(f => {
            const isInFolder = f.name.startsWith(folderName + '/');
            const isMp3 = f.name.toLowerCase().endsWith('.mp3');
            return isInFolder && isMp3;
        });
        
        return files.map(f => {
            const rawName = f.name.split('/').pop().replace('.mp3', '');
            const cleanName = rawName.replace(/^BH_\d+_/, '').replace(/_/g, ' ');
            
            // Encode path parts individually to match Archive.org server expectations
            const encodedPath = f.name.split('/').map(p => encodeURIComponent(p)).join('/');

            // Handle missing length/duration safely
            const dur = parseFloat(f.length || f.duration || 0);

            return {
                title: cleanName,
                name: cleanName,
                duration: dur,
                path: `${yearId}/${f.name}`,
                url: `https://archive.org/download/${yearId}/${encodedPath}`
            };
        }).sort((a,b) => a.title.localeCompare(b.title));
    } catch(e) {
        console.warn(`NET WARN: ${e.message}`);
        return [];
    }
}