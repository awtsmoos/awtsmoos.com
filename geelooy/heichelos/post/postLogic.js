//B"H
/**
 * Main Entry Point for the Post Application.
 * Consolidated Logic to prevent "Failed to fetch" errors.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { addTab, makeInfoHTML, makeNavBars, interpretPostDayuh, appendHTML, loadFontSize, scrollToActiveEl } from "./postFunctions.js";
import { loadRootComments, init, indexSwitch } from "./commentLogic.js";

/**
 * --- API LOGIC (Formerly logic/api.js) ---
 */
async function fetchAwtsmoos(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
}

async function loadInitial() {
    const myPath = location.pathname.split("/").filter(Boolean);
    const seriesId = myPath[myPath.length - 2];
    const postIdx = myPath[myPath.length - 1];
    const heichel = myPath[1];
    
    const series = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/details`);
    const postId = series.posts[postIdx];
    const post = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/post/${postId}`);
    
    window.post = post;
    window.series = series;

    const breadcrumb = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/breadcrumb`);
    window.breadcrumb = breadcrumb;
    
    if (document.querySelector("title")) {
        document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
    }
    
    return { post, series, heichel, seriesId, indexInSeries: parseInt(postIdx) };
}

/**
 * --- CORE LOGIC (Formerly logic/core.js) ---
 */
async function hasHeichelAuthority(heichel, alias) {
    if (!alias) return false;
    const res = await fetch(`/api/social/alias/${alias}/heichelos/${heichel}/ownership`);
    const json = await res.json();
    return !!json.yes;
}

async function startItAll() {
    console.log("%c B\"H - Reader Core Engaging", "color: #ccff00; background: #000; font-weight: bold;");
    
    const sidebar = document.querySelector(".sidebar");
    const realPost = document.querySelector("#realPost");

    try {
        const data = await loadInitial();
        const { post, series, heichel, indexInSeries } = data;
        
        const curAlias = window.curAlias;
        window.doesOwn = await hasHeichelAuthority(heichel, curAlias);

        if (post) {
            const heichelDetails = await getHeichelDetails(heichel);
            post.heichel = { id: heichel, ...heichelDetails };
            
            const aliasDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aliasDetails };

            if (sidebar) {
                const rootTab = addTab({
                    header: "Post Details",
                    name: "postInfo",
                    async onopen({ actualTab }) {
                        actualTab.innerHTML = "";
                        const info = makeInfoHTML();
                        if (typeof info === "string") actualTab.innerHTML = info;
                        else actualTab.appendChild(info);
                        
                        const btn = document.createElement("button");
                        btn.className = "awtsmoos-hero-btn";
                        btn.innerHTML = `<span>💬 View Comments</span>`;
                        btn.onclick = () => {
                            addTab({
                                header: "Comments",
                                name: "comments",
                                async onopen({ actualTab: comTab, tab: t }) {
                                    comTab.innerHTML = "<div style='padding:20px; text-align:center'>Loading...</div>";
                                    await loadRootComments({ post, parent: comTab, tab: t });
                                    await init({ post, parent: comTab, tab: t });
                                }
                            }).open();
                        };
                        actualTab.appendChild(btn);
                    }
                });
                rootTab.open();
            }

            if (realPost) {
                realPost.innerHTML = "";
                if (post.content) appendHTML(post.content, realPost);
                if (post.dayuh) await interpretPostDayuh(post);
                appendHTML(makeNavBars(post, series, indexInSeries), realPost);
            }
        }
    } catch (e) {
        console.error("FATAL B\"H ERROR:", e);
        if (realPost) realPost.innerHTML = `<div style="padding:20px; color:red;">B"H - Encountered an issue loading the light: ${e.message}</div>`;
    }
}

/**
 * --- UI LISTENERS (Formerly logic/listeners.js) ---
 */
function setupUIListeners() {
    document.addEventListener("click", (e) => {
        const commentBtn = e.target.closest("#commentaryBtn");
        if (commentBtn) {
            e.stopPropagation();
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) {
                const isHidden = sidebar.classList.contains("hidden-comments");
                sidebar.classList.toggle("hidden-comments");
                commentBtn.classList.toggle("pushed", isHidden);
                if (isHidden) window.dispatchEvent(new CustomEvent("awtsmoos index"));
            }
            return;
        }

        const minMaxBtn = e.target.closest("#minMax");
        if (minMaxBtn) {
            e.stopPropagation();
            const postDetails = document.getElementById("postDetails");
            if (postDetails) {
                const isHidden = postDetails.classList.contains("hidden-details");
                postDetails.classList.toggle("hidden-details");
                minMaxBtn.classList.toggle("pushed", isHidden);
            }
        }
    });

    window.openPanel = () => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.classList.contains("hidden-comments")) {
            sidebar.classList.remove("hidden-comments");
            document.getElementById("commentaryBtn")?.classList.add("pushed");
        }
    };
}

async function setupHighlightingLogic() {
    const { startHighlighting } = await import("./functions/interaction.js");
    startHighlighting("realPost", {
        onSection: (section) => {
            if (!section) return;
            const idx = section.dataset.awtsmoosIdx;
            const { updateQueryStringParameter } = import("./functions/utils.js").then(m => {
                m.updateQueryStringParameter("idx", idx);
                window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx } }));
            });
        }
    });
}

/**
 * --- RUNTIME ---
 */
(async () => {
    console.log("%c B\"H - Revelation Fully Engaged", "color: #2b00ff; font-weight: bold;");

    try {
        setupUIListeners();
        loadFontSize();
        await startItAll();
        await setupHighlightingLogic();
        scrollToActiveEl();
        await indexSwitch();
    } catch (e) {
        console.error("FATAL CORE ERROR:", e);
        const rp = document.getElementById("realPost");
        if (rp) rp.innerHTML = `<div style="color:red; font-family:monospace; padding:40px;">B"H - System Rupture: ${e.message}</div>`;
    }
})();