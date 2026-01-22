// B"H
// FILE: js/file-operations.js

import { DropHandler } from './file-ops/drop-handler.js';
import { Exporter } from './file-ops/exporter.js';
import { Transfer } from './file-ops/transfer.js';

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
    pullAndOverwrite: (folder, info) => Transfer.pullAndOverwrite(folder, info)
};