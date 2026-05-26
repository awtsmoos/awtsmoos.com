
//B"H
/**
 * @file commentLogic.js
 * @description
 * Orchestrator of Insights. Fixed to ensure signatures match calls,
 * and unified to use the supreme rendering pipeline.
 */
import { CommentSection } from "./CommentSection.js";
import { 
    getCommentsByAlias, getCommentsOfAlias, AwtsmoosPrompt 
} from "/scripts/awtsmoos/api/utils.js";
import { 
    addTab, updateQueryStringParameter, isFirstCharacterHebrew 
} from "/heichelos/post/postFunctions.js";
import { makeHTMLFromComment } from "/heichelos/post/comments/render/core.js";
import { registerFork } from "/heichelos/post/comments/render/ai/structure.js";

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

    // Update Root List
    if (window.insightManager) {
        const currentView = window.insightManager.getCurrent();
        
        if (window.mainCommentArea) {
             await makeCommentatorList(window.mainCommentArea, window.rootCommentTabObj);
        }
        
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
        const res = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId,
            postId: window.post.id,
            heichelId: window.post.heichel.id,
            fromCache: false,
            get: { verseSection: vs, map: true }
        });
        return Array.isArray(res) ? res :[];
    } catch(e) { return[]; }
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
    
    let displayComments = Array.isArray(comments) ? comments :[];
    
    // Unroll Map if present
    if (comments && typeof comments === 'object' && !Array.isArray(comments)) {
        displayComments =[];
        Object.values(comments).forEach(arr => {
            if (Array.isArray(arr)) displayComments.push(...arr);
        });
    }

    if (activeSub !== null) {
        displayComments = displayComments.filter(c => {
            const cSub = c.dayuh?.subSection;
            return cSub == activeSub; 
        });
        if(displayComments.length === 0) {
             actualTab.innerHTML = `<div class="awtsmoos-empty-placeholder">@${alias} has no insights on Paragraph ${activeSub+1}.<br><button onclick="window.commentLogic.showAllVerse()" class="btn awtsmoos-hero-btn" style="margin-top:10px;">Show Entire Verse</button></div>`;
             return;
        }
    }

    if (displayComments.length === 0) {
        actualTab.innerHTML = `<div class="awtsmoos-empty-placeholder">Empty vessel.</div>`;
        return;
    }

    // B"H - THE SUPREME UNIFICATION
    // All comments now flow through the exact same Scribe logic, ensuring
    // deduplication, massive font sizing, and correct component structures.
    displayComments.forEach(c => {
        c.id = String(c.id);
        registerFork(c);
        const card = makeHTMLFromComment(c);
        actualTab.appendChild(card);
    });
}

window.commentLogic = window.commentLogic || {};
window.commentLogic.showAllVerse = async () => {
    activeSub = null; 
    if(window.currentAliasBeingViewed && window.currentAliasTabContainer) {
        await renderAliasInsights({ alias: window.currentAliasBeingViewed, actualTab: window.currentAliasTabContainer, post: window.post });
    }
};

export async function handleNewComment(data) {
    await indexSwitch(true);
}

addEventListener("awtsmoos index", indexSwitch);
window.commentLogic.handleNewComment = handleNewComment;
