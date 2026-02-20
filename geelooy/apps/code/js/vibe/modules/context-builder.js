// B"H
// FILE: js/vibe/modules/context-builder.js
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextBuilder = {
    /**
     * B"H - Builds the context for the AI.
     * It relativizes all file paths against the session's rootPath.
     */
    async build(tab) {
        const rootPath = tab.vibeSession.rootPath;
        const workspaceId = tab.item.workspaceId;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        
        if (!workspace) return 'B"H - Workspace not found.';

        const rootItem = {
            ...workspace,
            path: rootPath,
            kind: 'directory',
            workspaceId: workspaceId
        };

        // B"H - Passing rootPath as the base ensuring relative paths in the .md
        return await Transfer.generateMarkdownContext([rootItem], rootPath);
    }
};