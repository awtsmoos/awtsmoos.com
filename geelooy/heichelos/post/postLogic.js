//B"H
/**
 * @file postLogic.js
 * @description 
 * In the realm of Atzilus, the Orchestrator weaves the modular sparks 
 * into a singular, functioning Vessel of Revelation. 
 * This module governs the lifecycle of the Post Reader:
 * 1. Initializing the Celestial Coordinates (Data Fetching).
 * 2. Manifesting the Living Scroll (Content Scribing).
 * 3. Activating the High-Intensity Synchronization (Highlighting/Conduction).
 * 4. Binding the Intentions of the Observer (Global UI Events).
 * 
 * Omissions are prohibited. The Kav must reach the very bottom.
 */

import { 
    getHeichelDetails,
    getAliasName
} from "/scripts/awtsmoos/api/utils.js";
            
import {
    makeNavBars,
    addTab,
    makeInfoHTML,
    loadFontSize,
    updateQueryStringParameter,
    scrollToActiveEl,
    startHighlighting,
    appendHTML
} from "/heichelos/post/postFunctions.js";

import {
    interpretPostDayuh
} from "/heichelos/post/logic/scribe.js";

import {
    loadRootComments,
    init as initCommentConduit, 
    indexSwitch 
} from "/heichelos/post/commentLogic.js";

import AIServiceHandler from "/ai/aiService.js";

// --- THE CELESTIAL CONSTANTS ---
const letters = "קראטוןםפשדגכעיחלךףזסבהנמצתץ";
const endMarker = '׃';

/**
 * @method fetchAwtsmoos
 * @description Retrieves JSON data from the higher worlds (Endpoints).
 */
async function fetchAwtsmoos(url) {
    console.log(`B"H - [PostLogic] Fetching Revelation: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`B"H - [PostLogic] Celestial Rupture at ${url}:`, e);
        return null;
    }
}

/**
 * @method loadInitial
 * @description Gathers the necessary coordinates (IDs) and retrieves the Post and Series context.
 */
async function loadInitial() {
    console.log("B\"H - [PostLogic] loadInitial: Locating Revelation...");
    const myPath = location.pathname.split("/").filter(Boolean);
    const hIdx = myPath.indexOf("heichelos");
    if (hIdx === -1 || !myPath[hIdx + 1]) throw new Error("Missing Heichel Coordinate.");

    const heichelId = decodeURIComponent(myPath[hIdx + 1]);
    let seriesId = null;
    let postIdx = null;
    let postId = null;

    if (myPath.includes("series")) {
        const sIdx = myPath.indexOf("series");
        seriesId = decodeURIComponent(myPath[sIdx + 1]);
        postIdx = parseInt(myPath[sIdx + 2]);
    } else if (myPath.includes("post")) {
        const pIdx = myPath.indexOf("post");
        postId = decodeURIComponent(myPath[pIdx + 1]);
    }

    // Retrieve Series Context
    const series = await fetchAwtsmoos(`/api/social/heichelos/${heichelId}/series/${seriesId}/details`);
    if (series && Array.isArray(series.posts) && postIdx !== null) {
        postId = series.posts[postIdx];
    }
    
    // Retrieve actual Content
    const post = await fetchAwtsmoos(`/api/social/heichelos/${heichelId}/post/${postId}`);
    const breadcrumb = await fetchAwtsmoos(`/api/social/heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
    
    // Populate Global State
    window.post = post;
    window.series = series;
    window.breadcrumb = breadcrumb;
    window.parentSeries = seriesId;
    window.heichelId = heichelId;
    window.currentIndexInSeries = postIdx;

    if (document.querySelector("title") && post && series) {
        document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
    }

    return { post, series, heichelId, seriesId, indexInSeries: postIdx };
}

/**
 * @method hasHeichelAuthority
 * @description Verifies if the current observer is a Sovereign (Owner) of the Heichel.
 */
async function hasHeichelAuthority(heichel, alias) {
    if (!alias) return false;
    const res = await fetch(`/api/social/alias/${encodeURIComponent(alias)}/heichelos/${encodeURIComponent(heichel)}/ownership`);
    const json = await res.json();
    return !!json.yes;
}

/**
 * @method startItAll
 * @description 🚀 The Ignition. Builds the Vessels and pours the Light into them.
 */
async function startItAll() {
    console.log("%c B\"H - [Core] PostLogic: Quantum Ignition Engaged.", "color: #ccff00; font-weight: 900;");
    const realPost = document.getElementById("realPost");
    const sidebar = document.querySelector(".sidebar");
    const allTabs = document.querySelector(".all-tabs");

    try {
        const data = await loadInitial();
        const { post, series, heichelId, indexInSeries } = data;
        
        const curAlias = window.curAlias;
        window.doesOwn = await hasHeichelAuthority(heichelId, curAlias);

        if (post) {
            // Enriching the Post Vessel with Heichel and Alias Meta-data
            const heichelDetails = await getHeichelDetails(heichelId);
            post.heichel = { id: heichelId, ...heichelDetails };
            
            const aliasDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aliasDetails };

            // 1. Initializing Side Panels (Tabs)
            addTab({
                header: (series.prateem.name || "Details") + " | " + (post.title || "Revelation"),
                name: "postInfo",
                async onopen({ actualTab }) {
                    actualTab.innerHTML = "";
                    actualTab.appendChild(makeInfoHTML());
                    
                    // Root Actions in Info Tab
                    const actions = document.createElement("div");
                    actions.className = "post-root-actions";
                    
                    const cBtn = document.createElement("button");
                    cBtn.className = "awtsmoos-hero-btn";
                    cBtn.innerHTML = `<span>💬 Insights</span>`;
                    cBtn.onclick = () => window.commentTab.open();
                    actions.appendChild(cBtn);
                    
                    actualTab.appendChild(actions);
                },
                rootParent: sidebar
            }).open();

            window.commentTab = addTab({
                header: "Commentary",
                name: "comments",
                async onopen({ actualTab, tab }) {
                    actualTab.innerHTML = "<div class='loading'>B\"H Loading Commentary...</div>";
                    await loadRootComments({ post, parent: actualTab, tab });
                }
            });

            // 2. Manifesting Post Content (The Scroll)
            realPost.innerHTML = "";
            if (post.content) {
                appendHTML(post.content, realPost);
            }
            
            if (post.dayuh) {
                await interpretPostDayuh(post);
            }
            
            // Append Navigation Footer
            const navHtml = makeNavBars(post, series, indexInSeries);
            appendHTML(navHtml, realPost);

            // 3. Activating Conductor
            await initCommentConduit({ 
                post, 
                mainParent: allTabs, 
                parent: window.commentTab.actual, 
                tab: window.commentTab 
            });

            // 4. Activating Visual & Interaction Layers
            loadFontSize();
            scrollToActiveEl();
            
            // Engagement of the High-Intensity Highlighter
            startHighlighting(
                'realPost',
                'section', 
                ({ main, sub } = {}) => {
                    if (main) {
                        const idx = main.dataset.awtsmoosIdx || main.dataset.idx;
                        console.log("B\"H - Observer Focusing on Verse:", idx);
                        if (idx === undefined) return;
                        
                        updateQueryStringParameter("idx", idx);
                        window.dispatchEvent(new CustomEvent("awtsmoos index", {
                            detail: { idx: parseInt(idx), awtsmoos: "Awtsmoos", time: Date.now() }
                        }));
                    } else if (sub) {
                        const subIdx = sub.dataset.awtsmoosSub || sub.dataset.idx;
                        const parentIdx = sub.closest('.section')?.dataset.awtsmoosIdx || sub.closest('.section')?.dataset.idx;
                        console.log(`B"H - Observer Focusing on Paragraph: ${subIdx} of Verse ${parentIdx}`);
                        
                        if (subIdx === undefined) return;
                        
                        updateQueryStringParameter("idx", parentIdx);
                        updateQueryStringParameter("sub", subIdx);
                        
                        window.dispatchEvent(new CustomEvent("awtsmoos index", {
                            detail: { 
                                idx: parseInt(parentIdx), 
                                sub: parseInt(subIdx), 
                                awtsmoos: "Awtsmoos", 
                                time: Date.now() 
                            }
                        }));
                    }
                },
                () => {
                    // Deselect Ritual: Clearing the Eye of focus
                    console.log("B\"H - Observer deselecting.");
                    const url = new URL(window.location);
                    url.searchParams.delete("idx");
                    url.searchParams.delete("sub");
                    window.history.replaceState({ path: url.href }, '', url.href);
                    
                    window.dispatchEvent(new CustomEvent("awtsmoos index", { 
                        detail: { deselect: true, awtsmoos: "Awtsmoos", time: Date.now() } 
                    }));
                }
            );

            // Final Synchronize
            await indexSwitch();

        } else {
            realPost.innerHTML = "<h1>VOID: Could not load revelation.</h1>";
        }
    } catch (e) {
        console.error("FATAL B\"H ERROR in startItAll:", e);
        if (realPost) realPost.innerHTML = `<div class='fatal-error'>System Rupture: ${e.message}</div>`;
    }
}

// --- GLOBAL UI CONTROLS: BINDING THE OVERLAYS ---

const minMax = document.getElementById("minMax");
const postDetails = document.getElementById("typographyDetails");
const commentaryBtn = document.getElementById("commentaryBtn");

if (minMax) {
    minMax.onclick = () => {
        const isHidden = postDetails.classList.toggle("hidden-details");
        minMax.classList.toggle("pushed", !isHidden);
    };
}

if (commentaryBtn) {
    commentaryBtn.onclick = () => {
        const sidebar = document.querySelector(".sidebar");
        const isHidden = sidebar.classList.toggle("hidden-comments");
        commentaryBtn.classList.toggle("pushed", !isHidden);
        
        if (!isHidden) {
            // Re-sync on open
            window.dispatchEvent(new CustomEvent("awtsmoos index"));
        }
    };
}

/**
 * --- THE AI ORACLE ---
 */
const service = new AIServiceHandler();
window.awtsmoosAi = async (...args) => await service.awtsmoosAi(...args);
window.AIServiceHandler = AIServiceHandler;

// --- RUNTIME INCEPTION ---
(async () => {
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => startItAll());
        } else {
            await startItAll();
        }
    } catch (e) {
        console.error("B\"H Bootstrap Failure:", e);
    }
})();