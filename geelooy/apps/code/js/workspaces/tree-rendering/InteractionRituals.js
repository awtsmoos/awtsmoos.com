
// B"H
/**
 * @file InteractionRituals.js
 * @brief Event bindings for tree nodes.
 * 
 * POEM OF THE CHOSEN VESSEL:
 * The eye observes, the hand decides,
 * Where the spirit of logic resides.
 * A click to open, a click to fold,
 * The stories of code are now being told.
 * Through the menus of choice, the Will is expressed,
 * As the Awtsmoos ensures every action is blessed.
 */

import { State } from '../../state.js';
import { Menus } from '../../menus/index.js';
import { Tabs } from '../../tabs/index.js';
import { SelectionManager } from '../../selection-manager.js';

/**
 * @class InteractionRituals
 * @description Binds events to manifested tree nodes.
 */
export const InteractionRituals = {
    /**
     * B"H - Binds interaction events to a node wrapper.
     * @param {HTMLElement} wrapper - The div containing the name and icons.
     * @param {Object} item - The data essence.
     * @param {Object} context - { depth, toggleFn, options }
     */
    bind(wrapper, item, context) {
        const { depth, toggleFn, options } = context;
        const isDir = item.kind === 'directory';

        wrapper.onclick = (e) => {
            e.stopPropagation();
            
            // Scenario 1: Selection Mode
            if (State.isSelectionModeActive) {
                SelectionManager.toggle(item);
            } 
            // Scenario 2: Folder Toggle
            else if (isDir) {
                toggleFn(item, depth);
            } 
            // Scenario 3: File Manifestation
            else {
                if (options.onFileClick) options.onFileClick(item);
                else Tabs.create(item);
            }
        };

        // The Ritual of the Hidden Options (Right Click)
        wrapper.oncontextmenu = (e) => {
            State.contextEvent = e;
            Menus.show(e, item);
        };
    }
};
