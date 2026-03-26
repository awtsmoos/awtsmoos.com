
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

export const ContextMenu = {
    async show(e, item) {
        e.preventDefault(); e.stopPropagation();
        if (State.isSelectionModeActive) return;
        
        // B"H - Set the general target AND purify the tab target.
        State.contextTarget = item;
        State.contextTabTarget = null;

        Menus.hideAll();
        
        const mapKey = getItemUniquePath(item);
        const entry = State.domItemMap.get(mapKey);
        if (entry && entry.el) entry.el.classList.add("context-active");

        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
        const isReadOnly = workspace?.readOnly || false;

        let menuItems = FilesystemRitual.getItems(item);
        
        const gitItems = await GitRitual.getItems(item);
        if (gitItems.length > 0) {
            menuItems.push({ isSeparator: true });
            menuItems = menuItems.concat(gitItems);
        }

        menuItems.push({ isSeparator: true });
        menuItems = menuItems.concat(TransferRitual.getItems(item));

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Select Multiple", action: "start-selection", icon: "select-all" });
        
        if (item.kind === 'file') {
            const ext = item.name.split('.').pop().toLowerCase();
            if (ext === 'html' || ext === 'htm' || ext === 'js' || ext === 'mjs') {
                menuItems.push({ label: "Select Connected", action: "select-connected", icon: "link" });
            }
        }
        
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
