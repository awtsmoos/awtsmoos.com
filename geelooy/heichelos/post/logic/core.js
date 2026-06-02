//B"H
/**
 * @file core.js
 * @description 
 * The Heart of the Scribe. This module orchestrates the initial gathering 
 * of sparks—the data coordinates of the Revelation—and initiates the 
 * manifestation of the interface.
 * 
 * It is refined to handle both direct post identifiers and series-indexed 
 * paths, ensuring the observer always finds the Light.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { 
    addTab, 
    makeInfoHTML, 
    makeNavBars, 
    interpretPostDayuh, 
    appendHTML, 
    loadFontSize, 
    scrollToActiveEl 
} from "../postFunctions.js";
import { loadRootComments, init as initComments } from "../commentLogic.js";
import { setupUIListeners, setupHighlightingLogic, renderBookmarksPanel } from "./listeners.js";
import { initSelectionPopover, loadAnnotations } from "./selection.js";
import { initCommandPalette, openCommandPalette } from "./commandPalette.js";
import { setupScrollUnrollEffect, setupScribeLens, applyUserPreferences } from "./viewEffects.js";

/**
 * @method fetchAwtsmoos
 * @description Retrieves Divine Data from celestial endpoints.
 */
async function fetchAwtsmoos(url) {
    try {
        console.log(`B"H - [Core] Fetching: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`B"H - [Core] Fetch error at ${url}:`, e);
        return null;
    }
}

/**
 * @method loadInitial
 * @description B"H - Orchestrates the initial data gathering with robust pathing.
 */
async function loadInitial() {
    const myPath = location.pathname.split("/").filter(Boolean);
    const hIdx = myPath.indexOf("heichelos");
    if (hIdx === -1 || !myPath[hIdx + 1]) throw new Error("Coordinate Rupture: Missing Heichel ID.");

    const heichelId = decodeURIComponent(myPath[hIdx + 1]);
    let seriesId = "root";
    let postIdx = null;
    let postId = null;

    // Detect Series Navigation
    if (myPath.includes("series")) {
        const sIdx = myPath.indexOf("series");
        if (myPath[sIdx + 1]) seriesId = decodeURIComponent(myPath[sIdx + 1]);
        if (myPath[sIdx + 2]) postIdx = parseInt(myPath[sIdx + 2]);
    } 
    // Detect Direct Post Navigation
    else if (myPath.includes("post")) {
        const pIdx = myPath.indexOf("post");
        if (myPath[pIdx + 1]) postId = decodeURIComponent(myPath[pIdx + 1]);
    }

    let series = null;
    let post = null;

    const safeHeichel = encodeURIComponent(heichelId);

    // 1. Fetch Series if we need to resolve an index to an ID
    if (seriesId && postIdx !== null && !isNaN(postIdx)) {
        const safeSeries = encodeURIComponent(seriesId);
        series = await fetchAwtsmoos(`/api/social/heichelos/${safeHeichel}/series/${safeSeries}/details`);
        if (series && Array.isArray(series.posts)) {
            postId = series.posts[postIdx];
        }
    }

    // 2. Fetch Post Content using the resolved or direct ID
    if (postId) {
        const safePostId = encodeURIComponent(postId);
        const rootUrl = `/api/social/heichelos/${safeHeichel}/post/${safePostId}`;
        
        // Context-aware fetching
        post = await fetchAwtsmoos(rootUrl);
        
        // If we found the post but lack series context, attempt restoration
        if (post && (!series || seriesId === "root") && post.parentSeriesId) {
            seriesId = post.parentSeriesId;
            series = await fetchAwtsmoos(`/api/social/heichelos/${safeHeichel}/series/${encodeURIComponent(seriesId)}/details`);
        }
    }

    if (!post) {
        throw new Error(`B"H - The Revelation is obscured at these coordinates. H:${heichelId} P:${postId || 'index ' + postIdx}`);
    }

    // 3. Gather Breadcrumbs
    const safeSeries = encodeURIComponent(seriesId || 'root');
    const breadcrumb = await fetchAwtsmoos(`/api/social/heichelos/${safeHeichel}/series/${safeSeries}/breadcrumb`);
    
    window.post = post;
    window.series = series;
    window.breadcrumb = breadcrumb;

    if (document.querySelector("title")) {
        const seriesName = series?.prateem?.name || "Revelation";
        document.title = `${seriesName} | ${post.title || 'Untitled'}`;
    }
    
    return { 
        post, 
        series, 
        heichel: heichelId, 
        seriesId: seriesId || 'root', 
        indexInSeries: postIdx ?? post.indexInSeries ?? 0 
    };
}

/**
 * @method hasHeichelAuthority
 * @description Checks if the observer holds the keys to this Heichel.
 */
async function hasHeichelAuthority(heichel, alias) {
    if (!alias) return false;
    try {
        const res = await fetch(`/api/social/alias/${encodeURIComponent(alias)}/heichelos/${encodeURIComponent(heichel)}/ownership`);
        const json = await res.json();
        return !!json.yes;
    } catch(e) { return false; }
}

/**
 * @method startItAll
 * @description 🚀 The Great Manifestation. Orchestrates the birth of the reader.
 */
async function startItAll() {
    console.log("%c B\"H - [Core] Quantum Datastream Engaging", "color: #ccff00; background: #000; font-weight: bold;");
    
    const sidebar = document.querySelector(".sidebar");
    const realPost = document.querySelector("#realPost");

    try {
        const initData = await loadInitial();
        const { post, series, heichel, indexInSeries } = initData;
        
        const curAlias = window.curAlias;
        window.doesOwn = await hasHeichelAuthority(heichel, curAlias);

        if (post) {
            const hDetails = await getHeichelDetails(heichel);
            post.heichel = { id: heichel, ...hDetails };
            
            const aDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aDetails };

            if (sidebar) {
                // Initialize the root information tab
                const infoTab = addTab({
                    header: "Revelation Scroll",
                    name: "postInfo",
                    async onopen({ actualTab }) {
                        actualTab.innerHTML = "";
                        const infoHtml = makeInfoHTML();
                        if (typeof infoHtml === "string") actualTab.innerHTML = infoHtml;
                        else actualTab.appendChild(infoHtml);
                        
                        // Root Action Buttons
                        const actionsArea = document.createElement("div");
                        actionsArea.className = "post-root-actions awtsmoos-sidebar-actions";
                        actionsArea.style.cssText = "margin-top: 2.5rem; display: flex; flex-direction: column; gap: 15px;";

                        const createHeroBtn = (txt, icon, onClick) => {
                            const btn = document.createElement("button");
                            btn.className = "awtsmoos-hero-btn";
                            btn.innerHTML = `<span>${icon} ${txt}</span>`;
                            btn.onclick = onClick;
                            return btn;
                        };

                        actionsArea.appendChild(createHeroBtn("View Insights", "💬", () => {
                            addTab({
                                header: "Insights",
                                name: "comments",
                                async onopen({ actualTab: comTab, tab: t }) {
                                    comTab.innerHTML = "<div class='loading-spinner-placeholder awtsmoos-empty-placeholder'>B\"H Loading...</div>";
                                    await loadRootComments({ post, parent: comTab, tab: t });
                                    await initComments({ post, parent: comTab, tab: t });
                                }
                            }).open();
                        }));
                        
                        actionsArea.appendChild(createHeroBtn("Awtsmoos AI", "✨", async () => {
                             const { openAIChat } = await import("../ai/chat.js");
                             openAIChat();
                        }));

                        actionsArea.appendChild(createHeroBtn("My Bookmarks", "🔖", async () => {
                            addTab({
                                header: "Bookmarks",
                                name: "bookmarks",
                                async onopen({ actualTab: bTab }) { renderBookmarksPanel(bTab); }
                            }).open();
                        }));

                        if (post.dayuh?.footnotes?.length > 0) {
                            actionsArea.appendChild(createHeroBtn("Footnotes", "📜", () => {
                                if (window.openFootnotesPanel) window.openFootnotesPanel();
                            }));
                        }

                        actualTab.appendChild(actionsArea);
                    }
                });
                infoTab.open();
            }

            if (realPost) {
                realPost.innerHTML = "";
                if (post.dayuh) {
                    await interpretPostDayuh(post);
                } else if (post.content) {
                    appendHTML(post.content, realPost);
                }
                
                // Manifest Navigation and Footer
                appendHTML(makeNavBars(post, series, indexInSeries), realPost);
                loadAnnotations(); 
            }
        }
    } catch (e) {
        console.error("B\"H - FATAL CORE RUPTURE:", e);
        if (realPost) realPost.innerHTML = `
            <div class="fatal-error-display awtsmoos-empty-placeholder" style="padding: 50px; text-align: center; border: 4px solid var(--color-danger); margin: 20px;">
                <h2 style="color: var(--color-danger); text-transform: uppercase;">B"H - SYSTEM RUPTURE</h2>
                <p>The Light could not be manifest in this vessel:</p>
                <code style="background: #000; color: #fff; padding: 10px; display: block; margin-top: 20px;">${e.message}</code>
                <button onclick="location.reload()" class="btn" style="margin-top: 30px;">Attempt Restoration</button>
            </div>`;
    }
}

/**
 * --- BOOTSTRAP PROTOCOL ---
 */
const ignite = async () => {
    await new Promise(requestAnimationFrame);
    try {
        initSelectionPopover();
        initCommandPalette();
        applyUserPreferences();
        setupUIListeners();
        loadFontSize();
        
        await startItAll();
        
        await setupHighlightingLogic();
        setupScribeLens();
        setupScrollUnrollEffect(); 
        
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
        });
        
        window.addEventListener('popstate', () => scrollToActiveEl());
        scrollToActiveEl();
        
        console.log("B\"H - Reader Sovereignty Established.");
    } catch (e) {
        console.error("B\"H - Bootstrap Rupture:", e);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ignite);
} else {
    ignite();
}