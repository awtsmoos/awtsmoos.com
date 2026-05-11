
//B"H
/**
 * --- CONTEXT NEXUS ---
 * The organ of perception. It gathers the scattered sparks of the codebase 
 * and binds them into a single Markdown context for the AI.
 */
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextNexus = {
    /**
     * B"H - Generates a complete Markdown representation of the workspace root.
     * @param {object} tab - The Vibe tab.
     */
    async build(tab) {
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
