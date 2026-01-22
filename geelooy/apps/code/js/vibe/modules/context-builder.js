// B"H
// FILE: js/vibe/modules/context-builder.js

import { Transfer } from '../../file-ops/transfer.js';
import { State } from '../../state.js';

export const ContextBuilder = {
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

        return await Transfer.generateMarkdownContext([rootItem]);
    }
};