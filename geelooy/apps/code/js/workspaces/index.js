
// B"H
import { WorkspaceManager } from './manager.js';
import { WorkspaceDragDrop } from './drag-drop.js';
import { getItemUniquePath } from './utils.js';

export const Workspaces = {
    render: () => WorkspaceManager.render(),
    add: (ws, shouldSave) => WorkspaceManager.add(ws, shouldSave),
    remove: (workspaceId) => WorkspaceManager.remove(workspaceId),
    refreshNode: (item) => WorkspaceManager.refreshNode(item),
    setupDragDrop: (element, item) => WorkspaceDragDrop.setup(element, item),
};

export { getItemUniquePath };
