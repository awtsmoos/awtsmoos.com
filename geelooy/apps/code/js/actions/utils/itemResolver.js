
// B"H
/**
 * @file itemResolver.js
 * @brief THE PURE ESSENCE DECODER.
 * Unravels contexts without inheriting visually corrupted CSS parameters or chaotic title strings.
 */

import { State } from '../../state.js';

export const ItemResolver = {
    /**
     * Determines truth of destination reliably through ascending strict heuristics.
     * @param {object} context 
     * @returns {object|null}
     */
    resolve(context) {
        let item = null;
        
        // 1. Precise extraction from payloads
        if (context && typeof context === 'object') {
            if (context.path !== undefined && context.name !== undefined) {
                item = context; 
            } else if (context.item) {
                item = context.item;
            } else if (context.payload && context.payload.item) {
                item = context.payload.item;
            }
        }

        // 2. Safest Global Source of Truth (Memory state tracking)
        if (!item && typeof State !== 'undefined' && State.tabs) {
            let activeTab = null;
            if (State.activeTabId) activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (!activeTab) activeTab = State.tabs.find(t => t.isActive);
            
            if (activeTab && activeTab.item) {
                item = activeTab.item;
                console.log(`B"H - Pulled item successfully from internal logic states.`);
            }
        }

        // 3. Flawless DOM Extraction (Immune to corrupted titles!)
        if (!item) {
            console.log("B\"H - Navigating final logic depth - Document queries applied.");
            try {
                // Read from true data properties on UI bounds, totally ignoring arbitrary Title visual structures!
                const domActiveEl = document.querySelector('.tab-header.active, .tab.active');
                if (domActiveEl) {
                    const explicitDataId = domActiveEl.getAttribute('data-id');
                    if (explicitDataId && State && State.tabs) {
                        const preciseTab = State.tabs.find(t => t.id === explicitDataId || (t.item && t.item.id === explicitDataId));
                        if (preciseTab) item = preciseTab.item;
                    }

                    if (!item) {
                        const truePathData = domActiveEl.getAttribute('data-path');
                        // Ensures the path does NOT possess formatting artifacts like '::' or space dividers
                        if (truePathData && !truePathData.includes(' :: ')) {
                            item = {
                                path: truePathData,
                                name: truePathData.split('/').pop(),
                                kind: truePathData.includes('.') ? 'file' : 'directory'
                            };
                            console.log(`B"H - Formulated precise shell directly from [data-path]: ${truePathData}`);
                        }
                    }
                }
            } catch(e) { } // Silent absorb to ensure return of undefined allows dialog processing downstream
        }

        // Apply mandatory mapping characteristics 
        if (item && item.path && !item.type && State && State.workspaces) {
            const bindWs = State.workspaces.find(w => w.id === item.workspaceId) || State.workspaces.find(w => w.isActive);
            if (bindWs) item.type = bindWs.type;
        }

        if(item) {
            console.log(`B"H - Pure Essence Resolution Complete. Ready.`, item);
        } else {
            console.warn(`B"H - Resolution reached void limits - No entity parsed anywhere in DOM or Cache.`);
        }
        return item;
    }
};
