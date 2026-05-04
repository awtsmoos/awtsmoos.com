
/**
 * B"H
 * @module SidebarConduit
 * @chapter The Revelation of the Hidden
 * @description
 * This module orchestrates the physical manifestation of the Sidebar.
 */

import { toggleSidebar } from "/heichelos/post/logic/listeners.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";

export class SidebarConduit {
    /**
     * @method openChamber
     * @description Focuses the interface on a specific tab and coordinate.
     */
    static async openChamber({ idx = null, tab = 'insights' } = {}) {
        console.group(`%c B"H - [SidebarConduit] Opening ${tab} sanctuary.`, "color: #ffd700; font-weight: 900;");
        console.trace("B\"H - Tracing Sidebar Revelation.");

        if (idx !== null) {
            updateQueryStringParameter("idx", idx);
            updateQueryStringParameter("sub", null);
        }

        toggleSidebar(true);

        if (window.tabRefs && window.tabRefs[tab]) {
            console.log(`B"H - Manifesting '${tab}' chamber.`);
            window.tabRefs[tab].open();
        } else {
            console.error(`B"H - [Conduit] Tab '${tab}' not found in the Tabernacle.`);
        }
        console.groupEnd();
    }
}

// B"H - Eternal global portal
window.openInsightsSidebar = (idx) => SidebarConduit.openChamber({ idx });
