
/**
 * B"H
 * @module SidebarConduit
 * @chapter The Opening of the Gates
 * @description
 * This module is the Voice (Malchus) of the interface. 
 * When a Seeker clicks a Verse Sigil or an Insights button, 
 * this conduit translates that physical intent into the 
 * manifestation of the Sidebar Tabernacle.
 * 
 * Added Trace-Lights to track the sequence of the Seder.
 */

import { toggleSidebar } from "../../logic/listeners.js";
import { updateQueryStringParameter } from "../../functions/utils.js";

/**
 * @class SidebarConduit
 */
export class SidebarConduit {
    /**
     * @method openInsights
     * @description 
     * Orchestrates the transition from the concealment of the text 
     * to the revelation of the Insights Sidebar.
     * 
     * @param {Object} options - The blueprints of the opening.
     * @param {string|number} [options.verseIdx] - The coordinate to focus on.
     * @param {string} [options.tab='insights'] - The chamber to reveal.
     */
    static async openInsights({ verseIdx = null, tab = 'insights' } = {}) {
        console.group(`%c B"H - [SidebarConduit] Command: Open ${tab}`, "color: #ffcc00; font-weight: 900;");
        console.trace("B\"H - Tracing the origin of this Sidebar Opening request.");

        // 1. Update the seekers coordinates in the URL.
        if (verseIdx !== null) {
            console.log(`B"H - Focusing coordinates on Verse ${verseIdx}.`);
            updateQueryStringParameter("idx", verseIdx);
            updateQueryStringParameter("sub", null);
        }

        // 2. Command the sidebar to emerge.
        toggleSidebar(true);

        // 3. Command the TabManager to reveal the specific chamber.
        if (window.tabRefs && window.tabRefs[tab]) {
            console.log(`B"H - Manifesting the '${tab}' sanctuary.`);
            window.tabRefs[tab].open();
        } else {
            console.error(`B"H - [SidebarConduit] CRITICAL: Tab '${tab}' is not registered in the Tabernacle.`);
            console.log("Current tabRefs:", window.tabRefs);
        }
        console.groupEnd();
    }
}

/**
 * B"H - Eternal Global Conduit for legacy access and Verse Number clicks.
 */
window.openInsightsSidebar = (idx) => SidebarConduit.openInsights({ verseIdx: idx });
