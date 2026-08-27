// B"H
/**
 * @file BackendPreviewBuilder.js
 * @brief Launches backend previews inside the browser Node VM.
 */
import { NodeManager } from '../../node/manager.js';

export const BackendPreviewBuilder = {
    async build(ws, coreType, manifest, tabId) {
        if (!manifest.entry) throw new Error('Backend preview requires an entry file.');

        const pid = await NodeManager.spawn({ ...ws, type: coreType, path: manifest.entry, kind: 'file' }, tabId, { silentTerminal: false });
        const port = manifest.port || 3000;
        const url = `http://localhost:${port}`;

        return {
            url,
            pid,
            port,
            entry: manifest.entry,
            logs: [
                `Backend virtual process ${pid} launched from ${manifest.entry}.`,
                `Virtual URL: ${url}`
            ]
        };
    }
};
