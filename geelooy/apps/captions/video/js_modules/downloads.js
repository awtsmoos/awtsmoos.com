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
    // If already processing or empty, stop.
    if (appState.isDownloading || appState.downloadQueue.length === 0) return;
    
    appState.isDownloading = true;
    
    // We process until empty in a loop instead of recursion to prevent stack issues
    while (appState.downloadQueue.length > 0) {
        const item = appState.downloadQueue.shift();
        setStatus(`Saving: ${item.filename}...`, '');

        try {
            if (appState.selectedDownloadDirectoryHandle) {
                // --- FOLDER MODE ---
                // We await the write operation. This blocks the loop.
                const fileHandle = await appState.selectedDownloadDirectoryHandle.getFileHandle(item.filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(item.blob);
                await writable.close(); // Wait for file to close
            } else {
                // --- BROWSER DOWNLOAD MODE ---
                // We cannot "await" a browser download, but we can delay the next one
                triggerDownload(item.blob, item.filename);
                // Artificial delay to let browser catch up and GC clean up blobs
                await new Promise(r => setTimeout(r, 800)); 
            }
        } catch (e) {
            console.error("Save failed:", e);
            setStatus(`Error Saving ${item.filename}`, 'error');
            // Wait a bit on error before continuing
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    appState.isDownloading = false;
    setStatus('All Files Saved.', 'success');
}