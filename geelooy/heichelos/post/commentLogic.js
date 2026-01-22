//B"H
/**
 * @file commentLogic.js
 * @description
 * Orchestrator of Insights. Fixed to ensure signatures match calls.
 */
import { CommentSection } from "./CommentSection.js";
import { 
    getCommentsByAlias, getCommentsOfAlias, AwtsmoosPrompt 
} from "/scripts/awtsmoos/api/utils.js";
import { 
    addTab, updateQueryStringParameter, isFirstCharacterHebrew 
} from "/heichelos/post/postFunctions.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";

// STATE
var activeVerse = null;
var activeSub = null;
var cachedAliases = {};

// EXPORT 1: BRIDGE FUNCTION
export async function loadRootComments({ parent, tab }) {
    return await makeCommentatorList(parent, tab);
}

// EXPORT 2: INIT
export async function init({ post, parent, tab }) {
    window.post = post;
    window.mainCommentArea = parent;
    window.rootCommentTabObj = tab;
    // Initial sync
    const s = new URLSearchParams(location.search);
    const idx = s.get("idx");
    const sub = s.get("sub");
    if(idx !== null) {
        activeVerse = parseInt(idx);
        if(sub !== null) activeSub = parseInt(sub);
        // Force refresh logic immediately
        indexSwitch(true);
    }
}

// EXPORT 3: CONDUCTOR
export async function indexSwitch(force = false) {
    const s = new URLSearchParams(location.search);
    const rawIdx = s.get("idx");
    const rawSub = s.get("sub");
    
    const newVerse = (rawIdx === null) ? "root" : parseInt(rawIdx);
    const newSub = (rawSub === null) ? null : parseInt(rawSub);

    if (!force && activeVerse === newVerse && activeSub === newSub) return;
    
    activeVerse = newVerse;
    activeSub = newSub;
    console.log(`B"H - Context Sync: Verse ${activeVerse}, Sub ${activeSub}`);

    // Update Root List
    if (window.insightManager) {
        const currentView = window.insightManager.getCurrent();
        
        // If we are looking at the main list (no specific alias view pushed)
        // or if we forced a refresh
        if (window.mainCommentArea) {
             await makeCommentatorList(window.mainCommentArea, window.rootCommentTabObj);
        }
        
        // If we are deep inside a specific alias view, refresh it
        if (window.currentAliasBeingViewed && window.currentAliasTabContainer) {
             await renderAliasInsights({
                 alias: window.currentAliasBeingViewed,
                 actualTab: window.currentAliasTabContainer,
                 post: window.post
             });
        }
    }
}

// DATA FETCHING
async function getCommentatorList() {
    const vs = activeVerse ?? "root";
    try {
        // We do NOT use sub-section filtering for the main list, we show everyone in the Verse.
        const res = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId,
            postId: window.post.id,
            heichelId: window.post.heichel.id,
            fromCache: false,
            get: { verseSection: vs, map: true }
        });
        return Array.isArray(res) ? res : [];
    } catch(e) { return []; }
}

export async function makeCommentatorList(parentEl, rootTabObj) {
    parentEl.innerHTML = "";
    
    // 1. Transcription Portal
    const writingWrap = document.createElement("div");
    parentEl.appendChild(writingWrap);
    new CommentSection(writingWrap);

    // 2. List of Commentators
    const listWrap = document.createElement("div");
    listWrap.className = "awtsmoos-insight-list-wrap";
    parentEl.appendChild(listWrap);
    
    const aliases = await getCommentatorList();
    if (aliases.length === 0) {
        listWrap.innerHTML = `<div class="awtsmoos-empty-placeholder">No insights manifest here yet.</div>`;
        return;
    }

    aliases.forEach(aliasId => {
        window.insightManager.addTab({
            header: "@" + aliasId,
            onopen: async ({ actualTab }) => {
                window.currentAliasBeingViewed = aliasId;
                window.currentAliasTabContainer = actualTab;
                await renderAliasInsights({ alias: aliasId, actualTab, post: window.post });
            },
            onclose: () => {
                window.currentAliasBeingViewed = null;
                window.currentAliasTabContainer = null;
            }
        });
    });
}

async function renderAliasInsights({ alias, actualTab, post }) {
    actualTab.innerHTML = `<div class="awtsmoos-loading-text">Gathering sparks...</div>`;
    
    const comments = await getCommentsOfAlias({
        seriesId: post.parentSeriesId,
        postId: post.id,
        heichelId: post.heichel.id,
        aliasId: alias,
        fromCache: true,
        get: { verseSection: activeVerse, map: true }
    });

    actualTab.innerHTML = "";
    
    // Filter for sub-section if active
    let displayComments = Array.isArray(comments) ? comments : [];
    if (activeSub !== null) {
        displayComments = displayComments.filter(c => {
            // Include root comments of the verse AND comments specific to the sub-paragraph
            // Usually, standard is: show everything in verse, maybe highlight specific?
            // User requested: "Commenting on SPECIFIC idx or sub section".
            // So if sub is active, we prioritise showing that.
            const cSub = c.dayuh?.subSection;
            return cSub == activeSub; // Loose equality for string/int mix
        });
        if(displayComments.length === 0) {
             actualTab.innerHTML = `<div class="awtsmoos-empty-placeholder">@${alias} has no insights on Paragraph ${activeSub+1}.<br><button onclick="window.commentLogic.showAllVerse()" class="btn-text">Show Verse</button></div>`;
             return;
        }
    }

    if (displayComments.length === 0) {
        actualTab.innerHTML = `<div class="awtsmoos-empty-placeholder">Empty vessel.</div>`;
        return;
    }

    displayComments.forEach(c => {
        const card = document.createElement("div");
        card.className = "awtsmoos-comment-card " + (isFirstCharacterHebrew(c.content) ? "heb" : "en");
        
        // Render content
        card.innerHTML = `<div class="content">${markdownToHtml(c.content)}</div>`;
        
        // Actions
        const actions = document.createElement("div");
        actions.className = "card-actions";
        
        const replyBtn = document.createElement("button");
        replyBtn.innerHTML = "↩ Reply";
        replyBtn.onclick = () => import("./comments/actions.js").then(m => m.handleReply(c, card));
        
        actions.appendChild(replyBtn);
        card.appendChild(actions);
        
        actualTab.appendChild(card);
    });
}

// Allow switching back to full verse view from sub view error
window.commentLogic = window.commentLogic || {};
window.commentLogic.showAllVerse = async () => {
    activeSub = null; // Clear sub filter locally
    if(window.currentAliasBeingViewed && window.currentAliasTabContainer) {
        await renderAliasInsights({ alias: window.currentAliasBeingViewed, actualTab: window.currentAliasTabContainer, post: window.post });
    }
};

/**
 * @method handleNewComment
 * @description Re-fetch and re-render everything after submission.
 */
export async function handleNewComment(data) {
    console.log("B\"H - New Insight Anchored. Refreshing...");
    await indexSwitch(true); // Force refresh
}

addEventListener("awtsmoos index", indexSwitch);
window.commentLogic.handleNewComment = handleNewComment;