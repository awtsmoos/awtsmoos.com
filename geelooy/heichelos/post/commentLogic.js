//B"H
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { updateQueryStringParameter } from "./functions/utils.js";

// Import from new modules
import { invalidateVerseCache, currentVerse, currentSub, setCurrentVerse, setCurrentSub, loadedInlineVerses, getCurrentVerse, getCurrentSub } from "./comments/state.js";
import { makeCommentatorList, loadRootComments, openCommentsPanelToAlias, openCommentsOfAlias, updateCommentHeader, getAndSaveAliases } from "./comments/panel.js";
import { addCommentsInline, getInlineAliases, isAliasInline } from "./comments/inline.js";

// Re-export for compatibility
export { loadRootComments } from "./comments/panel.js";

export function getIdx() {
	var s = new URLSearchParams(location.search);
	var idx = s.get("idx");
	if(idx === null) return null;
	return parseInt(idx);
}

export function getSub() {
    var s = new URLSearchParams(location.search);
	var sub = s.get("sub");
	if(sub === null) return null;
	return parseInt(sub);
}

export async function init({ post, mainParent, parent, rootTab, tab }) {
	window.post=post;
	window.rootTab=rootTab;
	window.mainParent=mainParent;
	window.parent = parent;
	window.tabComment = tab;
    
	var inlines = getInlineAliases();
	if(inlines.length > 0) await reloadRoot();
}

export async function reloadRoot() {
    await indexSwitch(true);
}
window.reloadRoot = reloadRoot;
window.openCommentsPanelToAlias = openCommentsPanelToAlias;
window.showAllInlineComments = async function() { await reloadRoot(); };

/**
 * @method indexSwitch
 * @description B"H - Orchestrates sidebar alignment with scroll state.
 */
export async function indexSwitch(eventOrForce = false) {
    let idxNum, subNum;
    
    if (eventOrForce && eventOrForce.detail) {
        idxNum = eventOrForce.detail.idx !== undefined ? eventOrForce.detail.idx : getIdx();
        subNum = eventOrForce.detail.sub !== undefined ? eventOrForce.detail.sub : getSub();
    } else {
        idxNum = getIdx();
        subNum = getSub();
    }

    const newVerse = (!idxNum && idxNum !== 0) ? "root" : idxNum;
    const force = (eventOrForce === true);
    
    if (!force && currentVerse === newVerse && currentSub === subNum) return;
    
    setCurrentVerse(newVerse);
    setCurrentSub(subNum);
	
	if(window.tabComment && window.tabComment.awtsmoosType == "main commentator list") {
		await makeCommentatorList(window.tabParent, window.tabComment);
	}

	if(window.tabManager) {
        const cur = window.tabManager.getCurrent();
        if(cur) {
            if(cur.awtsmoosType == "specific alias comments") {
                if(window.currentAliasTabContainer)
                    openCommentsOfAlias({
                        alias: window.currentAliasBeingViewed,
                        actualTab: window.currentAliasTabContainer,
                        post: window.post,
                    });
            } 
            else if (cur.awtsmoosType == "ai chat") {
                if (window.refreshAIChatContext) {
                    window.refreshAIChatContext();
                }
            }
        }
    }
    
	await updateCommentHeader();

    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        const commentators = await getAndSaveAliases(true);
        for (const aliasId of commentators) {
            if (!inlineAliases.includes(aliasId)) continue;
            const cacheKey = `${aliasId}-${newVerse}`;
            if (loadedInlineVerses[cacheKey]) continue;

            const comments = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId,
                postId: window?.post?.id,
                heichelId: window?.post?.heichel.id,
                aliasId: aliasId,
                get: { verseSection: newVerse, map: true }
            });

            addCommentsInline(comments, aliasId);
            loadedInlineVerses[cacheKey] = true;
        }
    }
}

/**
 * @method handleNewComment
 * @description B"H - Final synchronization of new data across all visual layers.
 */
export async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    invalidateVerseCache(verseSection);

    // 1. Update In-Text Holders (Flames)
    if (isAliasInline(aliasId) && newCommentData) {
        const memoryKey = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[memoryKey];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[memoryKey] = true;
    }
    
    // 2. Refresh Sidebar List
    if(window.tabParent && window.tabComment) {
        await makeCommentatorList(window.tabParent, window.tabComment, true);
    }

    // 3. Refresh Global Header
    await updateCommentHeader();

    // 4. Force Refresh Inline Thread Container (If open) - THE CRITICAL LINK
    if (window.awtsmoosInline?.refreshSectionCommentary) {
        const sub = getSub();
        // Delay slightly for server processing
        setTimeout(() => window.awtsmoosInline.refreshSectionCommentary(verseSection, sub), 500);
    }

    const cur = window.tabManager?.getCurrent();
    if(cur && cur.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed === aliasId) {
         await openCommentsOfAlias({
            alias: aliasId,
            actualTab: cur.actual,
            post: window.post,
        });
    } 
    else if (window.tabManager && window.tabManager.getCurrent() === window.rootLevelCommentatorTab) {
        await openCommentsPanelToAlias(aliasId, true);
    }
}

window.commentLogic = { 
    handleNewComment,
    reloadRoot,
    getCurrentVerse,
    getCurrentSub
};

removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);
