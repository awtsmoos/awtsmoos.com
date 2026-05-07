
/**
 * B"H
 * @module BootstrapRitual
 * @chapter Ignition of Consciousness
 * @description
 * The Great Seder Histalshelus begins here. We gather the initial coordinates, 
 * instantiate the boundaries of the text, and perform the Unified Gathering 
 * to pull down all commentary light from the Awtsmoos at once.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { makeNavBars, loadFontSize, scrollToActiveEl, appendHTML, makeInfoHTML } from "/heichelos/post/postFunctions.js";
import { interpretPostDayuh } from "/heichelos/post/logic/scribe.js";
import { loadRootComments, updateCommentHeader } from "/heichelos/post/comments/panel.js";
import { indexSwitch } from "/heichelos/post/logic/conductor.js";
import { applyUserPreferences } from "/heichelos/post/logic/preferences.js";

import { setupUIListeners, renderBookmarksPanel } from "/heichelos/post/logic/listeners.js";
import { setupViewEffects } from "/heichelos/post/logic/viewEffects.js";

import { renderFootnotesPanel } from "/heichelos/post/comments/panel/footnotes.js";
import TabManager from "/heichelos/post/TabManager.js";
import { loadInitial } from "/heichelos/post/logic/initialization/coordinates.js";
import { populateRootMenu } from "/heichelos/post/logic/initialization/sidebarContent.js";
import { manifestAllActiveInlines } from "/heichelos/post/comments/inline.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { commentaryStore } from "/heichelos/post/comments/state/store.js";
import { unrollApiResponse } from "/heichelos/post/comments/logic/unroller.js";

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
            })
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

        // B"H - UNIFIED COMMENT GATHERING
        // We fetch every voice that spoke upon this scroll in a single surge of light.
        // Healed to account for Series ID and Unrolling object maps.
        try {
            const seriesContextStr = post.parentSeriesId && post.parentSeriesId !== "root" ? `/series/${encodeURIComponent(post.parentSeriesId)}` : "";
            const url = `/api/social/heichelos/${encodeURIComponent(hId)}${seriesContextStr}/post/${encodeURIComponent(post.id)}/comments`;
            
            console.log(`B"H - [Bootstrap] Summoning all unified light from the Awtsmoos: ${url}`);
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                
                // Purifying the outer kelipot (object wrappers) into a pure array of light
                const allComments = unrollApiResponse(data);
                
                if (Array.isArray(allComments) && allComments.length > 0) {
                    console.log(`B"H - [Bootstrap] Unified gathering successful! Anchoring ${allComments.length} sparks into the Master Cache.`);
                    // Anchor to Holy Store
                    commentaryStore.masterCommentCache = allComments;
                    
                    // Auto-register every Guardian for Inline Manifestation
                    const aliases = [...new Set(allComments.map(c => c.author).filter(Boolean))];
                    const currentInline = new URLSearchParams(location.search).get("inline");
                    if (!currentInline && aliases.length > 0) {
                        updateQueryStringParameter("inline", JSON.stringify(aliases));
                    }
                } else {
                    console.log(`B"H - [Bootstrap] Unified gathering found no sparks (Void state). Master Cache remains pure potential.`);
                    commentaryStore.masterCommentCache = [];
                }
            } else {
                 console.warn(`B"H - [Bootstrap] Unified gathering encountered a rupture in the API gateway. Status: ${res.status}`);
                 commentaryStore.masterCommentCache = [];
            }
        } catch(e) {
            console.warn("B\"H - Disruption in initial unified gathering. We will rely on the Fallback Transmitters.", e);
            commentaryStore.masterCommentCache = [];
        }

        // B"H - Manifest Marginal Insights across the initial scroll view
        await manifestAllActiveInlines();

        await indexSwitch(true);
        await updateCommentHeader();
        scrollToActiveEl();

    } catch (e) {
        console.error("B\"H - Bootstrap Rupture:", e);
        if(viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}
