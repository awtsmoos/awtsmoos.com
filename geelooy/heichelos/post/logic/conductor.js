// /BH/awtsmoos.com/geelooy/heichelos/post/logic/conductor.js
//B"H
/**
 * @file conductor.js
 * The Master Conductor. Now with HIGH INTENSITY feedback.
 */
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { updateQueryStringParameter } from "../functions/utils.js";
import { invalidateVerseCache, setCurrentVerse, setCurrentSub, loadedInlineVerses, getCurrentVerse, getCurrentSub } from "../comments/state.js";
import { makeCommentatorList, openCommentsPanelToAlias, openCommentsOfAlias, updateCommentHeader, getAndSaveAliases } from "../comments/panel.js";
import { addCommentsInline, getInlineAliases } from "../comments/inline.js";

// Helper getters
export function getIdx() {
    const s = new URLSearchParams(location.search);
    const val = s.get("idx");
    return val === null ? null : parseInt(val);
}

export function getSub() {
    const s = new URLSearchParams(location.search);
    const val = s.get("sub");
    return (val === null || val === "null") ? null : parseInt(val);
}

export async function reloadRoot() {
    console.log("B\"H - [Conductor] Forcing re-manifestation of root context.");
    const verse = getIdx() ?? "root";
    invalidateVerseCache(verse);
    await indexSwitch(true);
}
window.reloadRoot = reloadRoot;

/**
 * @method indexSwitch
 * @description Orchestrates UI updates when coordinates change.
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
    
    if (!force && getCurrentVerse() === targetVerse && getCurrentSub() === subNum) return;
    
    setCurrentVerse(targetVerse);
    setCurrentSub(subNum);
    
    if (window.tabManager) {
        const activeTab = window.tabManager.getCurrent();
        if (activeTab?.name === "insights") {
            await makeCommentatorList(activeTab.actual);
        } else if (activeTab?.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed) {
            await openCommentsOfAlias({ alias: window.currentAliasBeingViewed, actualTab: activeTab.actual, post: window.post });
        } else if (activeTab?.awtsmoosType === "ai chat" && window.refreshAIChatContext) {
            window.refreshAIChatContext();
        }
    }
    
    await updateCommentHeader();

    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        for (const aliasId of inlineAliases) {
            const comments = await getCommentsOfAlias({
                seriesId: window.post?.parentSeriesId, postId: window.post?.id, heichelId: window.post?.heichel.id,
                aliasId: aliasId, get: { verseSection: targetVerse, map: true }
            });
            addCommentsInline(comments, aliasId);
        }
    }
}

/**
 * @method handleNewComment
 * @description 
 * ✨ INSANE FEEDBACK LOOP ✨
 * 1. Obliterates the cache.
 * 2. Updates inline view instantly.
 * 3. Forces the Sidebar to open the user's tab.
 * 4. Scrolls to the new comment and makes it flash.
 */
export async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    console.log(`B"H - [Conductor] INSANE feedback loop initiated for new comment: ${commentId}`);
    
    // 1. Invalidate memory
    invalidateVerseCache(verseSection);

    // 2. Immediate Inline Update
    if (getInlineAliases().includes(aliasId) && newCommentData) {
        const key = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[key];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[key] = true;
    }
    
    // 3. Re-manifest lists
    await reloadRoot(); 
    
    // 4. COMMAND THE SIDEBAR
    const tab = await openCommentsPanelToAlias(aliasId, true);
    if (!tab) return;
    
    // 5. THE FLASH
    setTimeout(() => {
        const newCommentElement = tab.querySelector(`.comment-content[data-cid="${commentId}"]`);
        if (newCommentElement) {
            newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newCommentElement.classList.add('highlight-flash');
            setTimeout(() => newCommentElement.classList.remove('highlight-flash'), 2500);
        }
    }, 400);
}

// B"H - EXPOSE THE CONDUIT
window.awtsmoosConductor = { handleNewComment };

removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);