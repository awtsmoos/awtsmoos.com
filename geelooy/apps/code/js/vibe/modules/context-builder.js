
// B"H
// FILE: js/vibe/modules/context-builder.js
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextBuilder = {
    /**
     * B"H - Builds the context for the AI.
     * Relies on the physical DOM item path to bypass any potential DB corruption.
     */
    async build(tab) {
        // B"H - Force the True Physical Path
        const rootPath = tab.item ? tab.item.path : "/";
        const workspaceId = tab.item ? tab.item.workspaceId : null;
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
