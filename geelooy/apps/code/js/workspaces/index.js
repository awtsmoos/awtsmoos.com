
// B"H
// FILE: js/workspaces/index.js

import { WorkspaceManager } from './manager.js';
import { WorkspaceDragDrop } from './drag-drop.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class Workspaces
 * @classdesc The Keter (Crown) - the ultimate facade. It stands at the highest 
 * peak of the Workspaces hierarchy, nullified to the will of the application. 
 * Like the Crown that bridges the Infinite to the Finite, this object provides 
 * the single point of entry for all workspace-related rituals. It coordinates 
 * the manifestation (rendering), the reception (drag-drop), and the 
 * re-perceiving (refreshing) of the project's many vessels.
 */
export const Workspaces = {
    /**
     * @function render
     * @description Orchestrates the total re-emanation of the workspace tree.
     */
    render: () => WorkspaceManager.render(),

    /**
     * @function add
     * @description Commands a new workspace to emerge from potential into actuality.
     */
    add: (ws, shouldSave) => WorkspaceManager.add(ws, shouldSave),

    /**
     * @function remove
     * @description Commands the retraction of a workspace's light from the UI.
     */
    remove: (workspaceId) => WorkspaceManager.remove(workspaceId),

    /**
     * @function refreshNode
     * @description Triggers a localized re-creation of a specific directory's branch.
     */
    refreshNode: (item) => WorkspaceManager.refreshNode(item),

    /**
     * @function setupDragDrop
     * @description Anoints a physical DOM element to receive new file essence.
     */
    setupDragDrop: (element, item) => WorkspaceDragDrop.setup(element, item),
};

// B"H - Exporting the True Name ritual directly from the Keter
export { getItemUniquePath };
