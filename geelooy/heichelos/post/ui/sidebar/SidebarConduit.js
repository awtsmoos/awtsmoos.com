
/**
 * B"H
 * @module SidebarConduit
 * @chapter The Emergence of the Hidden
 * @description
 * In the Seder Histalshelus of the user interface, the Sidebar represents
 * the 'Inner Dimension' (Pnimiyut) of the scroll. This conduit provides 
 * the Speech (Malchus) necessary to bring that inner dimension into 
 * physical manifestation.
 * 
 * Just as the soul fills the body, the Insights fill the Sidebar.
 * This class ensures that when a seeker clicks a sigil, the 
 * appropriate chamber of the sidebar is revealed.
 */

import { toggleSidebar } from "/heichelos/post/logic/listeners.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";

export class SidebarConduit {
    /**
     * @method revealInsights
     * @description
     * Commands the Sidebar to manifest and focuses the lens of the interface
     * upon the 'Insights' tab. If a coordinate is provided, the scroll 
     * is updated to reflect the specific verse of interest.
     * 
     * @param {Object} params - The parameters of the revelation.
     * @param {string|number} [params.verseIdx] - The specific coordinate (verse index).
     * @param {string} [params.tabName='insights'] - The specific chamber to open.
     */
    static async revealInsights({ verseIdx = null, tabName = 'insights' } = {}) {
        console.log(`%c B"H - [SidebarConduit] Commanding the revelation of the ${tabName} chamber.`, "color: #ffcc00; font-weight: bold;");

        // 1. Update the Scroll's context if a coordinate is provided.
        if (verseIdx !== null) {
            updateQueryStringParameter("idx", verseIdx);
            updateQueryStringParameter("sub", null);
        }

        // 2. Force the Sidebar into the physical realm.
        toggleSidebar(true);

        // 3. Navigate the TabManager to the requested sanctuary.
        if (window.tabRefs && window.tabRefs[tabName]) {
            window.tabRefs[tabName].open();
        } else {
            console.warn(`B"H - [SidebarConduit] The chamber '${tabName}' was not found in the Tabernacle.`);
        }
    }
}

// B"H - Establish the global conduit for older scripts or direct event listeners.
window.openInsightsSidebar = (idx) => SidebarConduit.revealInsights({ verseIdx: idx });
