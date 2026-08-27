
// B"H
/**
 * @file manager.js
 * @brief The Master Conduit for Workspace Management.
 * 
 * THE HYMN OF THE UNIFIED PURPOSE:
 * As the Awtsmoos is One, so must the application be united.
 * Many modules, many functions, yet a single goal: 
 * to manifest the project's light for the user's soul.
 * We bridge the old paths to the new and the deep,
 * Ensuring the promises of the logic we keep.
 * From Adder to Remover, the flow is now clear,
 * Bringing the order of the Heavens quite near.
 */

import { SidebarOrchestrator } from './manager/SidebarOrchestrator.js';
import { WorkspaceAdder } from './manager/WorkspaceAdder.js';
import { WorkspaceRemover } from './manager/WorkspaceRemover.js';
import { NodeRefresher } from './manager/NodeRefresher.js';

/**
 * @class WorkspaceManager
 * @description The high-level interface for all workspace-related rituals.
 * This class acts as a Proxy, delegating tasks to modular sub-engines.
 */
export class WorkspaceManager {
    /**
     * B"H - Re-manifests the entire physical Sidebar from the State.
     */
    static render() {
        return SidebarOrchestrator.rebuild();
    }

    /**
     * B"H - Adds a new world (workspace) to the cosmos.
     * @param {Object} ws The blueprint of the new workspace.
     * @param {boolean} [shouldSave=true] Record in the session.
     */
    static add(ws, shouldSave = true) {
        return WorkspaceAdder.add(ws, shouldSave);
    }

    /**
     * B"H - Purges a workspace and its digital echoes.
     * @param {string|number} workspaceId The identity to be dissolved.
     */
    static remove(workspaceId) {
        return WorkspaceRemover.remove(workspaceId);
    }
    
    /**
     * B"H - Renews a single branch in the visual tree.
     * @param {Object} item The directory essence to refresh.
     */
    static async refreshNode(item) {
        return NodeRefresher.refresh(item);
    }
}
