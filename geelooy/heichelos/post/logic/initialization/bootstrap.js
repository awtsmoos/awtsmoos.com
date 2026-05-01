
/**
 * B"H
 * @module BootstrapRitual
 * @chapter Ignition of Consciousness
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { makeNavBars, loadFontSize, scrollToActiveEl, appendHTML, makeInfoHTML } from "/heichelos/post/postFunctions.js";
import { interpretPostDayuh } from "/heichelos/post/logic/scribe.js";
import { loadRootComments, updateCommentHeader } from "/heichelos/post/comments/panel.js";
import { indexSwitch } from "/heichelos/post/logic/conductor.js";
import { applyUserPreferences } from "/heichelos/post/logic/preferences.js"; 
import { setupUIListeners, renderBookmarksPanel, toggleSidebar } from "/heichelos/post/logic/listeners.js";
import { setupViewEffects } from "/heichelos/post/logic/viewEffects.js"; 
import { renderFootnotesPanel } from "/heichelos/post/comments/panel/footnotes.js";
import TabManager from "/heichelos/post/TabManager.js";
import { loadInitial } from "/heichelos/post/logic/initialization/coordinates.js";
import { populateRootMenu } from "/heichelos/post/logic/initialization/sidebarContent.js";
import { manifestAliasInline, getInlineAliases } from "/heichelos/post/comments/inline.js";

async function restoreMarginaliaState() {
    const inlineAliases = getInlineAliases();
    for (const alias of inlineAliases) {
        await manifestAliasInline(alias);
    }
}

export async function ignite() {
    console.log("%c B\"H - Commencing Seder Histalshelus", "color: #ccff00; font-weight: 900;");
    const viewport = document.getElementById("realPost");
    const sidebar = document.querySelector(".sidebar");

    try {
        const { post, series, hId, pIdx } = await loadInitial();
        
        const [meta, aDetails] = await Promise.all([
            getHeichelDetails(hId).catch(() => ({})),
            getAliasName(post.author).catch(() => ({}))
        ]);

        post.heichel = { id: hId, ...meta };
        window.alias = { id: post.author, ...aDetails };
        window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;
        window.doesOwn = (window.curAlias === post.author);

        // 2. The Multi-Tabernacle Rewiring
        window.tabManager = new TabManager({ parent: sidebar, headerTxt: "Divine Context" });
        
        const tabRefs = {
            insights: window.tabManager.addTab({
                header: "Insights", name: "insights",
                onopen: async ({ actualTab, tab }) => await loadRootComments({ parent: actualTab, tab })
            }),
            details: window.tabManager.addTab({
                header: "Scroll Details", name: "details",
                onopen: async ({ actualTab }) => {
                    actualTab.innerHTML = "";
                    const infoNode = makeInfoHTML();
                    actualTab.appendChild(infoNode);
                }
            }),
            bookmarks: window.tabManager.addTab({
                header: "Bookmarks", name: "bookmarks",
                onopen: async ({ actualTab }) => renderBookmarksPanel(actualTab)
            }),
            footnotes: window.tabManager.addTab({
                header: "Footnotes", name: "footnotes",
                onopen: async ({ actualTab }) => renderFootnotesPanel(actualTab)
            })
        };
        
        // B"H - The Root Menu
        tabRefs.rootMenu = window.tabManager.addTab({
            header: "Main Menu", name: "rootMenu",
            onopen: async ({ actualTab }) => populateRootMenu(actualTab, post, tabRefs)
        });

        // 3. Form Rituals
        applyUserPreferences();
        setupUIListeners(); 
        setupViewEffects(); 
        loadFontSize();

        // 4. Manifest Content
        if(viewport) {
            viewport.innerHTML = "";
            if (post.dayuh) await interpretPostDayuh(post);
            else if (post.content) appendHTML(post.content, viewport);
            
            // B"H - The nav bars are now a pure DOM element forged by the Genesis Engine
            viewport.appendChild(makeNavBars(post, series, pIdx));
        }
        
        // Open the Main Menu by default instead of the verbose Details
        tabRefs.rootMenu.open();

        // 5. Restore Marginal Insights
        await restoreMarginaliaState();

        await indexSwitch(true);
        await updateCommentHeader();
        scrollToActiveEl();

    } catch (e) {
        console.error("B\"H - Bootstrap Rupture:", e);
        if(viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}
