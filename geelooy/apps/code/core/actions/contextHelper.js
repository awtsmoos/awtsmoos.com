
// B"H
/**
 * @file contextHelper.js
 * @brief THE PREPARATION OF THE VESSEL.
 * 
 * THE HYMN OF THE CARRIER:
 * The Action is fire, but the Context is wood,
 * Without the item, it's not understood.
 * We reach through the State, we find the true path,
 * To save the command from the void's silent wrath.
 * Whether by Tab or by Tree, we align,
 * Ensuring the context is truly divine.
 */
import { State } from '../../js/state.js';

/**
 * @class ActionContextHelper
 * @description Populates an action's context with the physical file system item it represents.
 */
export class ActionContextHelper {
    /**
     * B"H - Enriches the context with the physical item.
     * @param {object} context - The current action context.
     * @returns {object} The fortified context.
     */
    static enrich(context) {
        if (!context) return {};
        
        // B"H - If we already have a physical item, no need to search the heavens.
        if (context.physicalItem) return context;

        let item = context.item;

        // B"H - If we are acting on an editor tab, the item is the file.
        if (context.tabId) {
            const tab = State.tabs.find(t => t.id === context.tabId);
            if (tab && tab.item) {
                item = tab.item;
            }
        }

        // B"H - If we have no item, we search the active workspace root.
        if (!item) {
            const ws = State.workspaces.find(w => w.isActive);
            if (ws) item = { ...ws, kind: 'directory', path: '/' };
        }

        return {
            ...context,
            physicalItem: item
        };
    }
}
