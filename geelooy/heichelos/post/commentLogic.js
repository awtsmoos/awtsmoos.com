//B"H
/**
 * @file commentLogic.js
 * @description 
 * The Master Conductor of the Insight Realm. 
 * This module acts as the central hub, a Malkhus that receives the flow from 
 * the Specialized Panels and Conduits, then projects it outward to the 
 * rest of the application. 
 * 
 * It ensures the synchrony between the Observer's location on the Scroll 
 * and the Revelations stored in the Side Chambers.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { updateQueryStringParameter } from "./functions/utils.js";
import { 
    invalidateVerseCache, 
    setCurrentVerse, 
    setCurrentSub, 
    loadedInlineVerses, 
    getCurrentVerse, 
    getCurrentSub 
} from "./comments/state.js";

import { 
    makeCommentatorList, 
    openCommentsPanelToAlias, 
    openCommentsOfAlias, 
    updateCommentHeader, 
    getAndSaveAliases,
    loadRootComments as _loadRootComments // B"H - Import the core logic to re-export it
} from "./comments/panel.js";

import { addCommentsInline, getInlineAliases } from "./comments/inline.js";

/**
 * @method loadRootComments
 * @description B"H - Revealing the sacred gateway to the external modules. 
 * This ensures that postLogic can summon the commentary into the Vessel.
 */
export const loadRootComments = _loadRootComments;

/**
 * @method getIdx
 * @description Deciphers the current Verse coordinate from the URL's Tzimtzum.
 */
export function getIdx() {
    const s = new URLSearchParams(location.search);
    const idx = s.get("idx");
    if(idx === null) return null;
    return parseInt(idx);
}

/**
 * @method getSub
 * @description Deciphers the current Paragraph coordinate from the URL's Tzimtzum.
 */
export function getSub() {
    const s = new URLSearchParams(location.search);
    const sub = s.get("sub");
    if(sub === null || sub === "null") return null;
    return parseInt(sub);
}

/**
 * @method init
 * @description Initializes the conduit, binding the Post and its containers 
 * to the global awareness of the conductor.
 */
export async function init({ post, mainParent, parent, tab }) {
    console.log("B\"H - [Conductor] Initializing Comment Logic conduits.");
    window.post = post;
    window.mainParent = mainParent;
    window.parent = parent;
    window.tabComment = tab;
    
    const inlines = getInlineAliases();
    if(inlines.length > 0) await reloadRoot();
}

/**
 * @method reloadRoot
 * @description Forces a complete celestial refresh, clearing caches and re-conducting.
 */
export async function reloadRoot() {
    console.log("B\"H - [Conductor] reloadRoot: Requesting fresh transmission.");
    await indexSwitch(true);
}
window.reloadRoot = reloadRoot;

/**
 * @method indexSwitch
 * @description 🎼 The Symphony of State. Orchestrates the transition as the eye moves 
 * through the Scroll. High-Intensity synchronization for Verse and Paragraph.
 */
export async function indexSwitch(forceOrEvent = false) {
    let idxNum, subNum;
    
    // B"H - Handle both manual triggers and Highlighting events
    if (forceOrEvent && forceOrEvent.detail) {
        idxNum = forceOrEvent.detail.idx !== undefined ? forceOrEvent.detail.idx : getIdx();
        subNum = forceOrEvent.detail.sub !== undefined ? forceOrEvent.detail.sub : getSub();
    } else {
        idxNum = getIdx();
        subNum = getSub();
    }

    const targetVerse = (idxNum === null) ? "root" : idxNum;
    const force = (forceOrEvent === true);
    
    // Performance guard: Only act if the Kav of the observer actually shifted
    if (!force && getCurrentVerse() === targetVerse && getCurrentSub() === subNum) return;
    
    console.log(`B"H - [Conductor] Syncing Reality: Verse ${targetVerse}, Sub ${subNum}`);
    
    setCurrentVerse(targetVerse);
    setCurrentSub(subNum);
    
    // 1. Refresh the Main Commentator List in the Sidebar
    if (window.tabComment && window.tabComment.awtsmoosType === "main commentator list") {
        await makeCommentatorList(window.tabParent, window.tabComment);
    }

    // 2. Refresh open tabs for specific Aliases or AI
    if (window.tabManager) {
        const activeTab = window.tabManager.getCurrent();
        if (activeTab?.awtsmoosType === "specific alias comments") {
            if (window.currentAliasTabContainer) {
                await openCommentsOfAlias({
                    alias: window.currentAliasBeingViewed,
                    actualTab: window.currentAliasTabContainer,
                    post: window.post,
                });
            }
        } else if (activeTab?.awtsmoosType === "ai chat") {
            if (window.refreshAIChatContext) window.refreshAIChatContext();
        }
    }
    
    await updateCommentHeader();

    // 3. Coordinate the Inline "Flames" (Commentary nested in text)
    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        const commentators = await getAndSaveAliases(true);
        for (const aliasId of commentators) {
            if (!inlineAliases.includes(aliasId)) continue;
            
            const cacheKey = `${aliasId}-${targetVerse}-${subNum}`;
            if (loadedInlineVerses[cacheKey]) continue;

            const comments = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId,
                postId: window?.post?.id,
                heichelId: window?.post?.heichel.id,
                aliasId: aliasId,
                get: { verseSection: targetVerse, map: true }
            });

            addCommentsInline(comments, aliasId);
            loadedInlineVerses[cacheKey] = true;
        }
    }
}

/**
 * @method handleNewComment
 * @description ✨ The Ritual of Return. Called when a new Insight is transmitted 
 * to ensure all levels of the application are updated instantly.
 */
export async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    console.log(`B"H - [Conductor] Manifesting newly transmitted Insight: ${commentId}`);
    invalidateVerseCache(verseSection);

    // Update inline visuals if the author is currently manifest in the Scroll
    const inlines = getInlineAliases();
    if (inlines.includes(aliasId) && newCommentData) {
        const memoryKey = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[memoryKey];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[memoryKey] = true;
    }
    
    await reloadRoot(); 
    
    // Open the alias tab and illuminate the new comment
    const aliasTab = await openCommentsPanelToAlias(aliasId, true);
    if (aliasTab && commentId) {
        setTimeout(() => {
            const highlightTarget = aliasTab.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if (highlightTarget) {
                highlightTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightTarget.classList.add('highlight-flash');
                setTimeout(() => highlightTarget.classList.remove('highlight-flash'), 2500);
            }
        }, 400);
    }
}

// B"H - Global synchronization event binding
removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);