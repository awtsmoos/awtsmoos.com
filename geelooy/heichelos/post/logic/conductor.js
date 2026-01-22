//B"H
/**
 * @file conductor.js
 * @description The Master Conductor of Synchronicities. This module ensures that 
 * when the observer moves (Scroll/Click), the Sidebar and Data Caches respond 
 * in absolute harmony. No movement is ignored; no state is lost.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { updateQueryStringParameter } from "../functions/utils.js";
import { invalidateVerseCache, setCurrentVerse, setCurrentSub, loadedInlineVerses, getCurrentVerse, getCurrentSub } from "../comments/state.js";
import { makeCommentatorList, openCommentsPanelToAlias, openCommentsOfAlias, updateCommentHeader, getAndSaveAliases } from "../comments/panel.js";
import { addCommentsInline, getInlineAliases } from "../comments/inline.js";

/**
 * @method getIdx
 * @description Retrieves current Verse index from the URL.
 */
export function getIdx() {
    const s = new URLSearchParams(location.search);
    const val = s.get("idx");
    return val === null ? null : parseInt(val);
}

/**
 * @method getSub
 * @description Retrieves current Paragraph index from the URL.
 */
export function getSub() {
    const s = new URLSearchParams(location.search);
    const val = s.get("sub");
    return (val === null || val === "null") ? null : parseInt(val);
}

/**
 * @method reloadRoot
 * @description Forces a complete UI/Sidebar refresh by invalidating caches.
 */
export async function reloadRoot() {
    console.log("B\"H - [Conductor] Refreshing root context.");
    const verse = getIdx() ?? "root";
    invalidateVerseCache(verse);
    await indexSwitch(true);
}
window.reloadRoot = reloadRoot;

/**
 * @method indexSwitch
 * @description 🎼 The Symphony of State. Orchestrates the sidebar and inline comments.
 * @param {Boolean|Event} forceOrEvent If true, forces refresh. If Event, parses detail.
 */
export async function indexSwitch(forceOrEvent = false) {
    let idxNum, subNum;
    
    if (forceOrEvent && forceOrEvent.detail) {
        idxNum = forceOrEvent.detail.idx !== undefined ? forceOrEvent.detail.idx : getIdx();
        subNum = forceOrEvent.detail.sub !== undefined ? forceOrEvent.detail.sub : getSub();
    } else {
        idxNum = getIdx();
        subNum = getSub();
    }

    const targetVerse = (idxNum === null) ? "root" : idxNum;
    const force = (forceOrEvent === true);
    
    // Guard: Only act if coordinates shifted
    if (!force && getCurrentVerse() === targetVerse && getCurrentSub() === subNum) return;
    
    console.log(`B"H - [Conductor] Coordinates Shift: Verse ${targetVerse}, Paragraph ${subNum}`);
    
    setCurrentVerse(targetVerse);
    setCurrentSub(subNum);
    
    // 1. Synchronize Main Commentator List in Sidebar
    if (window.tabComment && window.tabComment.awtsmoosType === "main commentator list") {
        await makeCommentatorList(window.tabParent, window.tabComment);
    }

    // 2. Synchronize Open Tabs
    if (window.tabManager) {
        const activeTab = window.tabManager.getCurrent();
        if (activeTab?.awtsmoosType === "specific alias comments") {
            if (window.currentAliasTabContainer) {
                console.log(`B"H - [Conductor] Syncing alias tab for @${window.currentAliasBeingViewed}`);
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

    // 3. Synchronize Inline Commentary
    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        const commentators = await getAndSaveAliases(true);
        for (const aliasId of commentators) {
            if (!inlineAliases.includes(aliasId)) continue;
            
            // Unique key for the specific verse/sub combo
            const key = `${aliasId}-${targetVerse}-${subNum}`;
            if (loadedInlineVerses[key]) continue;

            console.log(`B"H - [Conductor] Loading inline commentary for @${aliasId}`);
            const comments = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId,
                postId: window?.post?.id,
                heichelId: window?.post?.heichel.id,
                aliasId: aliasId,
                get: { verseSection: targetVerse, map: true }
            });

            addCommentsInline(comments, aliasId);
            loadedInlineVerses[key] = true;
        }
    }
}

/**
 * @method handleNewComment
 * @description ✨ Orchestration after a user successfully transmits a comment.
 */
export async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    console.log(`B"H - [Conductor] Finalizing transmit: ${commentId}`);
    invalidateVerseCache(verseSection);

    // Update inline flames immediately if this user is being read inline
    if (getInlineAliases().includes(aliasId) && newCommentData) {
        const key = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[key];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[key] = true;
    }
    
    await reloadRoot(); 
    
    // Open the user's tab and highlight the new revelation
    const tab = await openCommentsPanelToAlias(aliasId, true);
    if (tab && commentId) {
        setTimeout(() => {
            const el = tab.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-flash');
                setTimeout(() => el.classList.remove('highlight-flash'), 2500);
            }
        }, 400);
    }
}

// Global Event Binding
removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);