// B"H
// FILE: js/file-ops/exporter.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { SelectionManager } from '../selection-manager.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';

export const Exporter = {
    async copyAsZip(items) {
        if (!items || items.length === 0) return;
        
        // B"H - Lazy Copy Strategy
        // We do not compress yet. We store the intent and references.
        State.clipboardZip = { 
            items: items, 
            type: 'lazy-zip', 
            name: items.length === 1 ? `${items[0].name}.zip` : 'selection.zip' 
        };
        State.fileClipboard = []; // Clear standard clipboard
        
        UI.showToast("Copied to clipboard (Zip on Paste)", "success");
        SelectionManager.end();
    },

    async downloadAsZip(items) {
        if (!items || items.length === 0) return;
        
        const taskId = `zip-dl-${Date.now()}`;
        UI.startTask(taskId, "Compressing for download...");
        
        try {
            const blob = await this.createZipBlob(items);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = items.length === 1 ? `${items[0].name}.zip` : 'archive.zip';
            a.click();
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', "Download started.");
        } catch (e) {
            UI.endTask(taskId, 'error', "Download failed: " + e.message);
            console.error(e);
        } finally {
            SelectionManager.end();
        }
    },

    async createZipBlob(items) {
        const zip = new ZipFile();
        
        const processItem = async (item, basePath) => {
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            const fullItem = { ...workspace, ...item };

            if (item.kind === 'file') {
                let content = await FileSystemProvider.read(fullItem);
                if (content instanceof Blob) content = new Uint8Array(await content.arrayBuffer());
                else if (typeof content === 'string') content = new TextEncoder().encode(content);
                else if (content.base64Content) {
                    const binStr = atob(content.base64Content);
                    content = new Uint8Array(binStr.length);
                    for(let i=0; i<binStr.length; i++) content[i] = binStr.charCodeAt(i);
                }
                
                zip.addFile(basePath ? `${basePath}/${item.name}` : item.name, content);
            } else if (item.kind === 'directory') {
                const children = await FileSystemProvider.list(fullItem);
                const newBase = basePath ? `${basePath}/${item.name}` : item.name;
                zip.addFolder(newBase);
                for (const child of children) {
                    await processItem({ ...child, workspaceId: item.workspaceId }, newBase);
                }
            }
        };

        for (const item of items) {
            await processItem(item, '');
        }

        return zip.build();
    },

    async downloadFile(item) {
        if (!item || item.kind !== 'file') return;
        
        const taskId = `dl-${Date.now()}`;
        UI.startTask(taskId, `Downloading ${item.name}...`);
        
        try {
            const content = await FileSystemProvider.read(item);
            let blob;
            
            if (content instanceof Blob) {
                blob = content;
            } else if (typeof content === 'string') {
                blob = new Blob([content], { type: 'text/plain' });
            } else if (content && content.base64Content) {
                 const binStr = atob(content.base64Content);
                 const len = binStr.length;
                 const bytes = new Uint8Array(len);
                 for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
                 blob = new Blob([bytes], { type: content.mime || 'application/octet-stream' });
            } else if (content instanceof ArrayBuffer) {
                blob = new Blob([content], { type: 'application/octet-stream' });
            }
            
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = item.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                UI.endTask(taskId, 'success', `Download started.`);
            } else {
                throw new Error("Could not prepare file for download.");
            }
        } catch (e) {
            UI.endTask(taskId, 'error', "Download failed: " + e.message);
            console.error("Download Error:", e);
        }
    }
};