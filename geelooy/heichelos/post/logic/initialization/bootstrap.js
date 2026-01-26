// /BH/awtsmoos.com/geelooy/heichelos/post/logic/initialization/bootstrap.js
//B"H
import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { makeNavBars, loadFontSize, scrollToActiveEl, appendHTML } from "/heichelos/post/postFunctions.js";
import { interpretPostDayuh } from "/heichelos/post/logic/scribe.js";
import { loadRootComments, updateCommentHeader } from "/heichelos/post/comments/panel.js";
import { indexSwitch } from "/heichelos/post/logic/conductor.js";
import { applyUserPreferences } from "/heichelos/post/logic/preferences.js"; 
import { setupUIListeners, renderBookmarksPanel, toggleSidebar } from "/heichelos/post/logic/listeners.js";
import { setupViewEffects } from "/heichelos/post/logic/viewEffects.js"; 
import { renderFootnotesPanel } from "/heichelos/post/comments/panel/footnotes.js";
import TabManager from "/heichelos/post/TabManager.js";
import { loadInitial } from "./coordinates.js";
import { populateRevelationTab } from "./sidebarContent.js";

export async function ignite() {
    console.log("%c B\"H - [BOOTSTRAP] RE-MANIFESTATION INITIATED.", "color: #ff00ff; background: #000; font-weight: 900; font-size: 14px;");
    const viewport = document.getElementById("realPost");
    const sidebar = document.querySelector(".sidebar");

    try {
        const { post, series, hId, pIdx } = await loadInitial();
        
        const [meta, aDetails] = await Promise.all([
            getHeichelDetails(hId).catch(() => ({})),
            getAliasName(post.author).catch(() => ({}))
        ]);

        post.heichel = { id: hId, ...meta };
        window.alias = window.aliasDetails = { id: post.author, ...aDetails };
        window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;

        window.tabManager = window.insightManager = new TabManager({
            parent: sidebar,
            headerTxt: "SACRED CHAMBERS"
        });

        const tabRefs = {};

        tabRefs.insights = window.insightsTabObj = window.insightManager.addTab({
            header: "Insights",
            name: "insights",
            onopen: async ({ actualTab, tab }) => await loadRootComments({ parent: actualTab, tab })
        });

        tabRefs.bookmarks = window.insightManager.addTab({
            header: "Bookmarks",
            name: "bookmarks",
            onopen: async ({ actualTab }) => renderBookmarksPanel(actualTab)
        });

        tabRefs.footnotes = window.insightManager.addTab({
            header: "Footnotes",
            name: "footnotes",
            onopen: async ({ actualTab }) => renderFootnotesPanel(actualTab)
        });
        
        window.openFootnotesPanel = () => { toggleSidebar(true); tabRefs.footnotes.open(); };

        const revelationTab = window.insightManager.addTab({
            header: "The Revelation",
            name: "revelation",
            onopen: async ({ actualTab }) => populateRevelationTab(actualTab, post, tabRefs)
        });
        tabRefs.revelation = revelationTab; // B"H - Register root tab

        applyUserPreferences();
        setupUIListeners(); 
        setupViewEffects(); 
        loadFontSize();

        if(viewport) {
            viewport.innerHTML = "";
            if (post.dayuh) await interpretPostDayuh(post);
            else if (post.content) appendHTML(post.content, viewport);
            appendHTML(makeNavBars(post, series, pIdx), viewport);
        }
        
        revelationTab.open();

        await indexSwitch(true);
        await updateCommentHeader();
        
        // B"H - URL STATE RESTORATION
        const urlParams = new URLSearchParams(window.location.search);
        const panelToOpen = urlParams.get('panel');
        const userToOpen = urlParams.get('u');

        if (panelToOpen && panelToOpen !== 'revelation') { // Don't re-open root
            const targetTab = Object.values(tabRefs).find(t => t.name === panelToOpen);
            if (targetTab) {
                console.log(`B"H - [Bootstrap] Restoring panel state from URL: ${panelToOpen}`);
                toggleSidebar(true);
                targetTab.open();
                
                if (panelToOpen === 'insights' && userToOpen) {
                    setTimeout(async () => {
                        console.log(`B"H - [Bootstrap] Restoring user view from URL: @${userToOpen}`);
                        const { openCommentsPanelToAlias } = await import("../comments/panel.js");
                        await openCommentsPanelToAlias(userToOpen, false); 
                    }, 500);
                }
            }
        }
        
        if (new URLSearchParams(location.search).get("idx")) {
            setTimeout(() => scrollToActiveEl(), 600);
        }

    } catch (e) {
        console.error("B\"H - [BOOTSTRAP] RUPTURE:", e);
        if(viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}
