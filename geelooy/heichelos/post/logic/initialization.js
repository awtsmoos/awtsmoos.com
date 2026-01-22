//B"H
/**
 * @file initialization.js
 * @description The Point of Origin. This module retrieves the sparks of data 
 * from the celestial endpoints (API) and forges the initial Vessels of 
 * Atzilus—the Side Panels and Tabs.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { addTab, makeInfoHTML, makeNavBars, loadFontSize, scrollToActiveEl } from "../postFunctions.js";
import { interpretPostDayuh } from "./scribe.js";
import { loadRootComments, init as initConduit, indexSwitch } from "./conductor.js";
import { setupUIListeners, setupHighlightingLogic, renderBookmarksPanel } from "./listeners.js";
import { loadAnnotations } from "./selection.js";

/**
 * @method fetchJson
 * @description Safely retrieves Divine Data.
 */
async function fetchJson(url) {
    console.log(`B"H - [Initialization] Fetching: ${url}`);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}: Celestial Rupture.`);
    return await r.json();
}

/**
 * @method bootApplication
 * @description 🚀 Orchestrates the birth of the Revelation Reader.
 */
export async function bootApplication() {
    console.log("%c B\"H - [Core] Reader Consciousness Awakening", "color: #ccff00; font-weight: 900;");
    const viewport = document.getElementById("realPost");

    try {
        // 1. Gather Initial Coordinates
        const path = location.pathname.split("/").filter(Boolean);
        const hId = decodeURIComponent(path[1]);
        let sId = null, pIdx = null, pId = null;

        if (path.includes("series")) {
            const sIdx = path.indexOf("series");
            sId = decodeURIComponent(path[sIdx + 1]);
            pIdx = parseInt(path[sIdx + 2]);
        }

        // 2. Fetch Divine Context
        const series = await fetchJson(`/api/social/heichelos/${hId}/series/${sId}/details`);
        if (series && Array.isArray(series.posts) && pIdx !== null) {
            pId = series.posts[pIdx];
        }
        
        const post = await fetchJson(`/api/social/heichelos/${hId}/post/${pId}`);
        const bread = await fetchJson(`/api/social/heichelos/${hId}/series/${sId}/breadcrumb`);
        
        // Populate global state vessels
        window.post = post;
        window.series = series;
        window.breadcrumb = bread;

        if (document.querySelector("title")) {
            document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
        }

        // 3. Ownership Verification
        const curAlias = window.curAlias;
        const ownCheck = await fetchJson(`/api/social/alias/${curAlias}/heichelos/${hId}/ownership`);
        window.doesOwn = !!ownCheck.yes;

        if (post) {
            // Enrich post with meta-data
            const hDetails = await getHeichelDetails(hId);
            post.heichel = { id: hId, ...hDetails };
            
            const aDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aDetails };

            // 4. Setup Sidebar Gates
            setupTabs(post, series, hId, pIdx);

            // 5. Manifest Content
            if (post.content) {
                const { appendHTML } = await import("../functions/utils.js");
                appendHTML(post.content, viewport);
            }
            if (post.dayuh) {
                await interpretPostDayuh(post);
            }
            
            // Footer Navigation
            const navHtml = makeNavBars(post, series, pIdx);
            const { appendHTML: append } = await import("../functions/utils.js");
            append(navHtml, viewport);
            
            // Link conductor logic
            await initConduit({ post, mainParent: document.body, parent: window.commentTab.actual, tab: window.commentTab });
            
            // 6. Interaction Layers
            loadFontSize();
            setupUIListeners();
            setupHighlightingLogic();
            loadAnnotations();
            
            scrollToActiveEl();
            await indexSwitch();
        }
    } catch (e) {
        console.error("FATAL B\"H CORE ERROR:", e);
        if (viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}

/**
 * @method setupTabs
 * @description Forges the Side Panel tabs.
 */
function setupTabs(post, series, hId, pIdx) {
    // Info Tab
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
    info.open();

    // Global reference for comments
    window.commentTab = addTab({
        header: "Commentary",
        name: "comments",
        async onopen({ actualTab, tab }) {
            actualTab.innerHTML = "<div class='loading'>B\"H Loading...</div>";
            await loadRootComments({ post, parent: actualTab, tab });
        }
    });
}