
/**
 * B"H
 * @module BootstrapRitual
 * @chapter Ignition of Consciousness
 * @description
 * The Great Seder Histalshelus begins here. We gather the initial coordinates, 
 * instantiate the boundaries of the text, and then awaken the inline guardians.
 * 
 * HEALED: We have removed the flawed 'Master Cache' fetch. The API is complex 
 * and must be queried precisely. We now rely entirely on the BulkLoader which 
 * queries the API per-verse exactly as the working Sidebar does.
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
import { renderApprovalsPanel } from "/heichelos/post/comments/panel/approvals.js";
import TabManager from "/heichelos/post/TabManager.js";
import { loadInitial } from "/heichelos/post/logic/initialization/coordinates.js";
import { populateRootMenu } from "/heichelos/post/logic/initialization/sidebarContent.js";
import { awakenInlineSparks } from "/heichelos/post/logic/initialization/autoInline.js";

export async function ignite() {
    console.log("%c B\"H - Commencing Unified Seder Histalshelus", "color: #ccff00; font-weight: 900;");
    const viewport = document.getElementById("realPost");
    const sidebar = document.querySelector(".sidebar");

    try {
        const { post, series, hId, pIdx } = await loadInitial();
        window.post = post;

        const [meta, aDetails] = await Promise.all([
            getHeichelDetails(hId).catch(() => ({})),
            getAliasName(post.author).catch(() => ({}))
        ]);

        post.heichel = { id: hId, ...meta };
        window.alias = { id: post.author, ...aDetails };
        window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;
        window.doesOwn = (window.curAlias === post.author);

        // --- DOM MANIFESTATION SEQUENCE ---

        window.tabManager = new TabManager({ parent: sidebar, headerTxt: "Divine Context" });
        
        window.tabRefs = {
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
            }),
            approvals: window.tabManager.addTab({
                header: "Approvals", name: "approvals",
                onopen: async ({ actualTab }) => renderApprovalsPanel(actualTab)
            })
        };

        window.openFootnotesPanel = async (footnoteId = null) => {
            toggleSidebar(true);
            const tab = window.tabRefs?.footnotes;
            if (tab?.open) await tab.open();
            if (footnoteId !== null && footnoteId !== undefined) {
                setTimeout(() => {
                    const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${CSS.escape(String(footnoteId))}"]`);
                    if (!item) return;
                    item.scrollIntoView({ behavior: "smooth", block: "center" });
                    item.classList.add("active");
                    setTimeout(() => item.classList.remove("active"), 2200);
                }, 350);
            }
        };

        
        
        window.tabRefs.rootMenu = window.tabManager.addTab({
            header: "Main Menu", name: "rootMenu",
            onopen: async ({ actualTab }) => populateRootMenu(actualTab, post, window.tabRefs)
        });

        applyUserPreferences();
        setupUIListeners();
        setupViewEffects();
        loadFontSize();

        if(viewport) {
            viewport.innerHTML = "";
            if (post.dayuh) await interpretPostDayuh(post);
            else if (post.content) appendHTML(post.content, viewport);
            viewport.appendChild(makeNavBars(post, series, pIdx));
        }

        window.tabRefs.rootMenu.open();

        // Finalize DOM indices so that the Inline Weaver has physical coordinates to attach to
        await indexSwitch(true);
        await updateCommentHeader();
        scrollToActiveEl();

        // B"H - AWAKEN THE MARGINALIA
        // Now that the scroll is physically manifest and indexed, we trigger the Oracle 
        // to read the URL and fetch the inline commentaries dynamically.
        await awakenInlineSparks();

    } catch (e) {
        console.error("B\"H - Bootstrap Rupture:", e);
        if(viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}
