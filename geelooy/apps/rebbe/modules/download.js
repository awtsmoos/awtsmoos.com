//B"H
// modules/download.js
import { saveTrack, getTrack } from '../store.js';
import { fetchBlob } from './network.js';
import * as Render from '../render.js';

export async function handleDownloadAction(type, target, method, state, callbacks) {
    if (type === 'year' && method === 'zip') {
        const url = `https://archive.org/compress/${target}`;
        window.open(url, '_blank');
        return;
    }
    
    if (type === 'track') {
        const track = state.currentTracks[target];
        if (!track) return;
        if (method === 'app') await downloadToApp(track, state, callbacks);
        else await downloadToDisk(track);
    } else if (type === 'folder') {
        const name = target;
        // Logic to ensure tracks are loaded is in main, we assume they are passed or loaded
        const tracks = state.folders[name];
        if (!tracks) {
            Render.log("LOAD FOLDER FIRST", true);
            return;
        }

        Render.log(`BATCH OPERATION: ${tracks.length} ITEMS`);
        for (const track of tracks) {
            if (method === 'app') {
                if (await getTrack(track.path)) continue; 
                await downloadToApp(track, state, callbacks);
            } else {
                await downloadToDisk(track);
            }
        }
        Render.log("BATCH OPERATION COMPLETE");
    }
}

async function downloadToApp(track, state, callbacks) {
    try {
        const blob = await fetchBlob(track.url);
        await saveTrack(track.path, blob);
        if(state.currentTracks.includes(track)) {
            Render.renderTracks(state.currentTracks, state.currentFolderName);
        }
    } catch(e) {
        Render.log(`SYNC FAILED: ${track.name}`, true);
    }
}

async function downloadToDisk(track) {
    try {
        let blob = await getTrack(track.path);
        if (!blob) blob = await fetchBlob(track.url);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = track.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    } catch(e) {
        Render.log(`EXTRACTION FAILED: ${track.name}`, true);
    }
}
