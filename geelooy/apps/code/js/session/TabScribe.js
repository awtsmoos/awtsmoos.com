
// B"H
/**
 * @file TabScribe.js
 * @brief Serializes the state of a singular tab.
 * 
 * THE PSALM OF THE RECORDED VISION:
 * Every tab is a portal, a window to code,
 * Carrying the user along their digital road.
 * We scribe every detail, the scroll and the name,
 * To keep the perspective exactly the same.
 * Even the DevTools, with their deep-seeing eye,
 * Are captured and stored as the moments fly by.
 */

import { DevToolsBridge } from '../devtools/bridge.js';

export const TabScribe = {
    /**
     * B"H - Transforms a living tab object into a persistable data packet.
     * @param {Object} tab - The tab vessel.
     * @returns {Object} The serialized record.
     */
    deconstruct(tab) {
        const safeItem = { ...tab.item };
        
        // B"H - EXTRACT DEEP METADATA: DevTools state is preserved via the Bridge
        const targetId = tab.fileType === 'devtools' ? tab.item.previewTabId : tab.id;
        const bridgeState = DevToolsBridge.getTabPersistentState(targetId);
        
        let devtoolsMetadata = null;
        if (bridgeState && (bridgeState.logs.length > 0 || bridgeState.networkReqs.length > 0)) {
            devtoolsMetadata = {
                activePanel: bridgeState.activePanel,
                selectedPath: bridgeState.selectedPath,
                expandedPaths: Array.from(bridgeState.expandedPaths || []),
                logs: bridgeState.logs.slice(-100), 
                networkReqs: bridgeState.networkReqs.slice(-100)
            };
        }

        return { 
            id: tab.id, 
            uniquePath: tab.uniquePath, 
            isDirty: tab.isDirty, 
            isUncommitted: tab.isUncommitted,
            pinned: tab.pinned || false, 
            scrollPos: tab.scrollPos || 0, 
            fileType: tab.fileType,
            isPreview: tab.isPreview, 
            item: safeItem, 
            content: tab.content, 
            devtoolsMetadata 
        };
    }
};
