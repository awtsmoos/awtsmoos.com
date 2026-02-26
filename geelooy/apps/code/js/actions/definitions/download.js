
// B"H
/**
 * @file download.js
 * @brief Bringing the spiritual into the physical (Download).
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { ContextParser } from '../utils/context-parser.js';

export const DownloadAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item || item.kind !== 'file') return;

        console.log("B\"H - Download: Extracting sparks from", item.path);
        
        const content = await FileSystemProvider.read(item);
        const blob = (content instanceof Blob) ? content : new Blob([content]);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
