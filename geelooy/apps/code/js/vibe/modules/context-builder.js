
// B"H
// FILE: js/vibe/modules/context-builder.js
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextBuilder = {
    /**
     * B"H - Builds the context for the AI.
     * It relativizes all file paths against the session's explicit path.
     */
    async build(tab) {
        // B"H - THE GRAND RECTIFICATION: 
        // VibeController saves the path as session.path, not session.rootPath!
        const rootPath = tab.vibeSession.path || tab.vibeSession.rootPath || (tab.item ? tab.item.path : "/");
        const workspaceId = tab.item.workspaceId;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        
        if (!workspace) return 'B"H - Workspace not found.';

        const rootItem = {
            ...workspace,
            path: rootPath,
            kind: 'directory',
            workspaceId: workspaceId
        };

        return await Transfer.generateMarkdownContext([rootItem], rootPath);
    }
};
