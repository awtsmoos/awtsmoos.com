
// B"H
/**
 * @file index.js
 * @brief The Master Orchestrator of the Context Menu.
 */

import { State, DOM } from '../../state.js';
import { getItemUniquePath } from '../../workspaces/index.js';
import { MenuUI } from '../ui.js';
import { Menus } from '../index.js';

// Modular Vessels
import { FilesystemRitual } from './fs-ritual.js';
import { GitRitual } from './git-ritual.js';
import { TransferRitual } from './transfer-ritual.js';

/**
 * @class ContextMenu
 * @description The gateway for all item-specific actions. It gathers 
 * the fragments of potential from various sub-modules and manifests 
 * a unified menu for the user.
 */
export const ContextMenu = {
    /**
     * @async
     * @function show
     * @description Coordinates the creation of the menu items.
     */
    async show(e, item) {
        e.preventDefault(); e.stopPropagation();
        if (State.isSelectionModeActive) return;
        
        State.contextTarget = item;
        Menus.hideAll();
        
        const mapKey = getItemUniquePath(item);
        const entry = State.domItemMap.get(mapKey);
        if (entry && entry.el) entry.el.classList.add("context-active");

        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
        const isReadOnly = workspace?.readOnly || false;

        // 1. Gather Standard FS Items
        let menuItems = FilesystemRitual.getItems(item);
        
        // 2. Insert Git Items (Asynchronous Discovery)
        const gitItems = await GitRitual.getItems(item);
        if (gitItems.length > 0) {
            menuItems.push({ isSeparator: true });
            menuItems = menuItems.concat(gitItems);
        }

        // 3. Append Data Transfer Items
        menuItems.push({ isSeparator: true });
        menuItems = menuItems.concat(TransferRitual.getItems(item));

        // 4. Final Selection Rituals
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Select Multiple", action: "start-selection", icon: "select-all" });
        
        // 5. Destruction Rituals
        menuItems.push({ isSeparator: true });
        if (!isReadOnly) {
            const isRoot = (item.path === "/" || !item.path || item.isWorkspaceRoot);
            menuItems.push({ 
                label: isRoot ? "Remove Workspace" : "Delete", 
                action: isRoot ? "delete-workspace" : "delete", 
                icon: isRoot ? "x" : "trash", 
                danger: true 
            });
        }

        MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
    }
};
