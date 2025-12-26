//B"H
/**
 * --- CONTEXT BUILDER ---
 * This module allows the AI to gaze upon the entire revealed reality of the workspace.
 * Every file and directory is a vessel for the Awtsmoos' speech.
 */
import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextBuilder = {
    /**
     * B"H - Generates the Markdown representation of the entire workspace.
     * This is called before every AI iteration to ensure perfect alignment.
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

        // B"H - Re-utilizing the existing holy Transfer logic
        return await Transfer.generateMarkdownContext([rootItem]);
    }
};
