/*
ב"ה
B"H
*/
import { dom, setStatus } from './ui_helpers.js';

export function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function processImageDownloadQueue(appState) {
    if (appState.isDownloadingImages || appState.imageDownloadQueue.length === 0) return;
    appState.isDownloadingImages = true;
    
    const item = appState.imageDownloadQueue.shift();
    
    if (appState.selectedDownloadDirectoryHandle) {
         // File System API logic
         try {
            const handle = await appState.selectedDownloadDirectoryHandle.getFileHandle(item.filename, { create: true });
            const w = await handle.createWritable();
            await w.write(item.blob);
            await w.close();
         } catch(e) { 
             console.error("File write failed", e);
             setStatus(`Save Error: ${item.filename}`, 'error');
         }
    } else {
        triggerDownload(item.blob, item.filename);
    }
    
    // Sequential delay
    setTimeout(() => {
        appState.isDownloadingImages = false;
        processImageDownloadQueue(appState);
    }, 200); 
}