//B"H
/**
 * --- CONTEXT NEXUS ---
 * The organ of perception. It gathers the scattered sparks of the codebase 
 * and binds them into a single Markdown context for the AI.
 * B"H - This allows the AI to see the whole world before it speaks.
 */
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextNexus = {
    /**
     * B"H - Generates a complete Markdown representation of the workspace root.
     * This is called before every iteration to ensure the AI's "eyes" are current.
     * @param {object} tab - The Vibe tab.
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

        // B"H - We use the existing holy ritual for Markdown generation.
        return await Transfer.generateMarkdownContext([rootItem]);
    }
};
