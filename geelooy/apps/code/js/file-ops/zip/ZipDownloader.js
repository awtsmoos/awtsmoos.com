
// B"H
/**
 * @file ZipDownloader.js
 * @brief Refactored Zip Download utilizing the Context Guard.
 */

import { UI } from '../../ui.js';
import { ZipBuilder } from './ZipBuilder.js';
import { ZipContextGuard } from './ZipContextGuard.js';

export const ZipDownloader = {
    async execute(items) {
        if (!items || items.length === 0) return;
        
        const taskId = `zip-dl-${Date.now()}`;
        UI.startTask(taskId, "Purifying Selection...");
        
        try {
            // 1. Guard the context against undefined IDs.
            const purified = ZipContextGuard.purifySelection(items);
            if (purified.length === 0) throw new Error("The selected structural components have dissolved from memory.");

            UI.updateTask(taskId, 10, "Weaving Archive...");

            // 2. Build the physical blob.
            const blob = await ZipBuilder.build(purified);
            
            // 3. Trigger the Browser's physical reception.
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = items.length === 1 ? `${items[0].name}.zip` : 'Awtsmoos_Bundle.zip';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', "Archive Downloaded.");
            
        } catch (e) {
            UI.endTask(taskId, 'error', `Zip Shevirah: ${e.message}`);
        }
    }
};
