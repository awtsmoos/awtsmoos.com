
/**
 * B"H
 * @module SidebarTabForge
 * @chapter Forging the Outer Vessels
 * @description
 * Just as the light descends through the Seder Histalshelus, it needs 
 * physical vessels to contain it. This module forges the Side Panels (Tabs) 
 * which serve as the primary gateway for the seeker to interact with the 
 * depth of the commentary.
 * 
 * Every tab is a Heichel (Chamber), constructed dynamically from the JSON 
 * letters of the blueprint.
 */

import { addTab, makeInfoHTML } from "../../postFunctions.js";
import { renderBookmarksPanel } from "../listeners.js";
import { loadRootComments } from "../conductor.js";

/**
 * @function setupTabs
 * @description 
 * Orchestrates the creation of the Information and Commentary tabs.
 * It assigns the Commentary tab to the global window object so that 
 * other realms of the application can commune with it.
 * 
 * @param {Object} post - The Divine Context of the current scroll.
 * @param {Object} series - The broader series to which it belongs.
 * @param {string} hId - The ID of the Heichel.
 * @param {number|null} pIdx - The index of the post in the series.
 */
export function setupTabs(post, series, hId, pIdx) {
    // 1. The Information Chamber
    const info = addTab({
        header: "Revelation Details",
        name: "postInfo",
        async onopen({ actualTab }) {
            actualTab.innerHTML = "";
            actualTab.appendChild(makeInfoHTML());
            
            const actions = document.createElement("div");
            actions.className = "post-root-actions";
            
            const cBtn = document.createElement("button");
            cBtn.className = "awtsmoos-hero-btn";
            cBtn.innerHTML = `<span>💬 Insights</span>`;
            cBtn.onclick = () => window.commentTab.open();
            
            const bBtn = document.createElement("button");
            bBtn.className = "awtsmoos-hero-btn";
            bBtn.innerHTML = `<span>🔖 Bookmarks</span>`;
            bBtn.onclick = () => {
                addTab({
                    header: "Bookmarks",
                    name: "bookmarks",
                    async onopen({ actualTab: bTab }) { renderBookmarksPanel(bTab); }
                }).open();
            };

            actions.append(cBtn, bBtn);
            actualTab.appendChild(actions);
        }
    });
    
    // Command the info tab to open initially
    info.open();

    // 2. The Great Assembly (Commentary Tab)
    window.commentTab = addTab({
        header: "Commentary",
        name: "comments",
        async onopen({ actualTab, tab }) {
            actualTab.innerHTML = "<div class='loading'>B\"H Loading Insights from the Heavens...</div>";
            await loadRootComments({ post, parent: actualTab, tab });
        }
    });
}
