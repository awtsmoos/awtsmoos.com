
// B"H
/**
 * @file orchestrator.js
 * @brief The Breath of the Trace.
 */

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { SelectionManager } from '../../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../../workspaces/index.js';
import { ParserFactory } from './parsers/factory.js';
import { SeekerPathMapper } from './path-mapper.js';
import { FileSystemProvider } from '../../fs-provider.js';

export const SeekerOrchestrator = {
    async seek(startItem) {
        State.contextEvent = null; 
        
        // Awaken Selection Mode
        SelectionManager.start(startItem);
        
        const queue = [startItem];
        const visited = new Set();
        const foldersToExpand = new Set(); 
        
        UI.showToast("B\"H - The Seeker awakens. Tracing connections...", "info");

        while (queue.length > 0) {
            if (!State.isSelectionModeActive) {
                console.log("[ConnectedSeeker] B\"H - Trace aborted by user.");
                break;
            }

            const current = queue.shift();
            const uPath = getItemUniquePath(current);
            
            if (visited.has(uPath)) continue;
            visited.add(uPath);

            SelectionManager.add(current);

            const wsId = current.workspaceId || current.id;
            const parentPath = current.path.substring(0, current.path.lastIndexOf('/')) || '/';
            
            const parts = parentPath.split('/').filter(Boolean);
            let accum = '';
            foldersToExpand.add(wsId + "::/");
            for (const part of parts) {
                accum += '/' + part;
                foldersToExpand.add(wsId + "::" + accum);
            }

            try {
                const contentRaw = await FileSystemProvider.read(current);
                const code = (contentRaw instanceof Blob) ? await contentRaw.text() : String(contentRaw);
                
                const links = await ParserFactory.extract(current, code);
                
                for (const link of links) {
                    const resolvedItem = await SeekerPathMapper.resolve(current, link);
                    if (resolvedItem) {
                        const rPath = getItemUniquePath(resolvedItem);
                        if (!visited.has(rPath)) {
                            queue.push(resolvedItem);
                        }
                    }
                }
            } catch (e) {
                console.warn("[ConnectedSeeker] B\"H - Failed to penetrate " + current.path + ":", e);
            }
            
            await new Promise(r => setTimeout(r, 10)); 
        }
        
        if (State.isSelectionModeActive) {
            UI.showToast("B\"H - Trace complete. Manifesting visual tree...", "info");
            
            for (const uniqueKey of foldersToExpand) {
                State.expandedFolders.add(uniqueKey);
            }

            // Await the DOM re-rendering
            await Workspaces.render();

            // B"H - The Ultimate Visual Enforcement: 
            // Query the newly built tree and manually enforce selection classes
            SelectionManager.refreshVisuals();

            setTimeout(() => {
                const entry = State.domItemMap.get(getItemUniquePath(startItem));
                if (entry && entry.el) {
                    entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }
};
