
// B"H
// FILE: js/file-ops/exporter.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { SelectionManager } from '../selection-manager.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';

/**
 * @class Exporter
 * @description This module handles the manifestation of the project's essence 
 * into downloadable or clipboard-ready archival forms.
 * 
 * THE POEM OF THE ARCHIVE:
 * To zip is to bind many into one. 
 * We gather the scattered sparks of files and folders
 * and enclose them in a single protective vessel.
 * The Awtsmoos allows for this concentration of essence,
 * making it easy to carry the light from one world to another.
 */
export const Exporter = {
    /**
     * @async
     * @function copyAsZip
     * @description B"H. Performs a 'Lazy Copy'. It does not compress now,
     * but remembers the items. Upon 'Paste', they will be woven together.
     * @param {Array} items The items to be marked for zipping.
     */
    async copyAsZip(items) {
        if (!items || items.length === 0) return;
        
        // Record the intent in the State vessel
        State.clipboardZip = { 
            items: [...items], 
            type: 'lazy-zip', 
            name: items.length === 1 ? `${items[0].name}.zip` : 'selection.zip' 
        };
        
        // Clear standard file clipboard to prevent confusion
        State.fileClipboard = []; 
        
        UI.showToast("Copied as ZIP (Compression on Paste)", "success");
        if (typeof SelectionManager?.end === 'function') SelectionManager.end();
    },

    /**
     * @async
     * @function downloadAsZip
     * @description B"H. Gathers content immediately and triggers a browser download.
     */
    async downloadAsZip(items) {
        if (!items || items.length === 0) return;
        
        const taskId = `zip-dl-${Date.now()}`;
        UI.startTask(taskId, "Weaving Archive...");
        
        try {
            const blob = await this.createZipBlob(items);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = items.length === 1 ? `${items[0].name}.zip` : 'archive.zip';
            a.click();
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', "Download Manifested.");
        } catch (e) {
            UI.endTask(taskId, 'error', "Zip Ritual Failed: " + e.message);
        }
    },

    /**
     * @async
     * @function createZipBlob
     * @description Recursive process of gathering contents and building the ZIP.
     */
    async createZipBlob(items) {
        const zip = new ZipFile();
        
        /**
         * @async
         * @function processItem
         * @description B"H. Navigates the internal structure of each chosen vessel.
         */
        const processItem = async (item, basePath) => {
            const ws = State.workspaces.find(w => w.id === (item.workspaceId || item.id));
            const fullItem = { ...ws, ...item, workspaceId: ws.id };

            if (item.kind === 'file') {
                let content = await FileSystemProvider.read(fullItem);
                
                // Transmute content to bytes
                let bytes;
                if (content instanceof Blob) bytes = new Uint8Array(await content.arrayBuffer());
                else if (typeof content === 'string') bytes = new TextEncoder().encode(content);
                else if (content?.base64Content) {
                    const bin = atob(content.base64Content);
                    bytes = new Uint8Array(bin.length);
                    for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                } else bytes = new Uint8Array(0);
                
                zip.addFile(basePath ? `${basePath}/${item.name}` : item.name, bytes);
            } else if (item.kind === 'directory') {
                const res = await FileSystemProvider.list(fullItem);
                const children = res.entries || [];
                const newBase = basePath ? `${basePath}/${item.name}` : item.name;
                
                zip.addFolder(newBase);
                for (const child of children) {
                    await processItem(child, newBase);
                }
            }
        };

        for (const item of items) await processItem(item, '');
        return zip.build();
    },

    /**
     * @async
     * @function downloadFile
     * @description Triggers download for a single file vessel.
     */
    async downloadFile(item) {
        if (!item || item.kind !== 'file') return;
        const taskId = `dl-${Date.now()}`;
        UI.startTask(taskId, `Gathering ${item.name}...`);
        
        try {
            const content = await FileSystemProvider.read(item);
            let blob = (content instanceof Blob) ? content : new Blob([content]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = item.name; a.click();
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success');
        } catch (e) {
            UI.endTask(taskId, 'error', e.message);
        }
    }
};
