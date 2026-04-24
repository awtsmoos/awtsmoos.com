
// B"H
// FILE: js/file-operations.js

import { DropHandler } from './file-ops/drop-handler.js';
import { Exporter } from './file-ops/exporter.js';
import { Transfer } from './file-ops/transfer.js';
import { FileSystemProvider } from './fs-provider.js';
import { Workspaces } from './workspaces/index.js';
import { UI } from './ui.js';

export const FileOperations = {
    handleDrop: (e, targetDir) => DropHandler.handle(e, targetDir),
    
    copySelected: () => Transfer.copySelected(),
    paste: (target) => Transfer.paste(target),
    copyAllContents: (items) => Transfer.copyAllContents(items),
    
    downloadAllContents: (items) => Transfer.downloadAllContents(items),
    copyAsZip: (items) => Exporter.copyAsZip(items),
    downloadAsZip: (items) => Exporter.downloadAsZip(items),
    downloadFile: (item) => Exporter.downloadFile(item),
    
    deleteSelected: () => Transfer.deleteSelected(),
    pullAndOverwrite: (folder, info) => Transfer.pullAndOverwrite(folder, info),
    cloneRepo: (githubSource, localTarget) => Transfer.cloneRepo(githubSource, localTarget),

    // B"H - IMPROVEMENT 10: The Echo of Multiplication
    async duplicateItem(item) {
        if (!item || item.kind !== 'file') {
            UI.showToast("Only single files can be duplicated directly.", "warning");
            return;
        }

        try {
            const extIdx = item.name.lastIndexOf('.');
            const nameBase = extIdx > 0 ? item.name.substring(0, extIdx) : item.name;
            const ext = extIdx > 0 ? item.name.substring(extIdx) : '';
            
            const newName = `${nameBase}_copy${ext}`;
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            
            const parentItem = { ...item, path: parentPath, kind: 'directory', name: parentPath.split('/').pop() || 'Root' };
            const newItem = { ...item, path: `${parentPath === '/' ? '' : parentPath}/${newName}`, name: newName };

            // Manifest the copy
            const rawContent = await FileSystemProvider.read(item);
            await FileSystemProvider.write(newItem, rawContent);
            
            // Refresh visuals
            await Workspaces.refreshNode(parentItem);
            UI.showToast(`Duplicated as ${newName}`, "success");

        } catch (e) {
            UI.showToast(`Duplication failed: ${e.message}`, "error");
        }
    }
};
