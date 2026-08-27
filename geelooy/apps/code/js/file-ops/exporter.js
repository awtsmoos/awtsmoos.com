
// B"H
import { ZipDownloader } from './zip/ZipDownloader.js';
import { ZipBuilder } from './zip/ZipBuilder.js';
import { FileSystemProvider } from '../fs-provider.js';
import { UI } from '../ui.js';
import { State } from '../state.js';
import { SelectionManager } from '../selection-manager.js';

export const Exporter = {
    async copyAsZip(items) {
        if (!items || items.length === 0) return;
        
        State.clipboardZip = { 
            items: [...items], 
            type: 'lazy-zip', 
            name: items.length === 1 ? `${items[0].name}.zip` : 'collective.zip' 
        };
        State.fileClipboard = []; 
        
        UI.showToast("Zipped projection aligned to virtual clipboard.", "success");
        if (SelectionManager?.end) SelectionManager.end();
    },

    async downloadAsZip(items) {
        await ZipDownloader.execute(items);
    },

    async createZipBlob(items) {
        return await ZipBuilder.build(items);
    },

    async downloadFile(item) {
        if (!item || item.kind !== 'file') return;
        const taskId = `dl-${Date.now()}`;
        UI.startTask(taskId, `Transferring singular: ${item.name}`);
        
        try {
            const rawContent = await FileSystemProvider.read(item);
            const compiledBlob = (rawContent instanceof Blob) ? rawContent : new Blob([rawContent]);
            const targetUrl = URL.createObjectURL(compiledBlob);
            
            const hook = document.createElement('a');
            hook.href = targetUrl;
            hook.download = item.name;
            
            document.body.appendChild(hook);
            hook.click();
            hook.remove();
            
            URL.revokeObjectURL(targetUrl);
            UI.endTask(taskId, 'success', 'Export finished.');
        } catch (e) {
            UI.endTask(taskId, 'error', `Breakage in extraction context: ${e.message}`);
        }
    }
};
