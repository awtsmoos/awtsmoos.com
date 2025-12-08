/* B"H */
import { setStatus } from './ui.js';

export function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export async function processQueue(appState) {
    // Simple lock to prevent concurrent processing overlaps
    if (appState.isDownloading || appState.downloadQueue.length === 0) return;
    
    appState.isDownloading = true;
    const item = appState.downloadQueue.shift();

    try {
        if (appState.selectedDownloadDirectoryHandle) {
            // File System Access API
            const handle = await appState.selectedDownloadDirectoryHandle.getFileHandle(item.filename, { create: true });
            const writable = await handle.createWritable();
            await writable.write(item.blob);
            await writable.close();
        } else {
            // Classic Download
            triggerDownload(item.blob, item.filename);
        }
    } catch (e) {
        console.error("Save failed:", e);
        setStatus(`Save Error: ${item.filename}`, 'error');
    }

    // Process next item with small delay to prevent browser choking
    setTimeout(() => {
        appState.isDownloading = false;
        if (appState.downloadQueue.length > 0) {
            processQueue(appState);
        }
    }, 150);
}