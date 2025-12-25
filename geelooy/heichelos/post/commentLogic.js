//B"H
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { updateQueryStringParameter } from "/heichelos/post/postFunctions.js";

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
 * Updated to handle live event details and AI Chat context refreshing.
 */
export async function indexSwitch(eventOrForce = false) {
    let idxNum, subNum;
    
    // B"H - Pull directly from event detail if available for maximum freshness
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
                // B"H - Refresh AI context labels as user scrolls
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
            // B"H - Use string key for consistency
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

export async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    invalidateVerseCache(verseSection);

    if (isAliasInline(aliasId) && newCommentData) {
        const memoryKey = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[memoryKey];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[memoryKey] = true;
    }
    
    if(window.tabParent && window.tabComment) {
        await makeCommentatorList(window.tabParent, window.tabComment, true);
    }

    await updateCommentHeader();

    const cur = window.tabManager?.getCurrent();
    if(cur && cur.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed === aliasId) {
         await openCommentsOfAlias({
            alias: aliasId,
            actualTab: cur.actual,
            post: window.post,
        });
        
        setTimeout(() => {
            const newEl = cur.actual.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if (newEl) {
                newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newEl.classList.add('highlight-new-comment');
                setTimeout(() => newEl.classList.remove('highlight-new-comment'), 2500);
            }
        }, 300);
    } 
    else if (window.tabManager.getCurrent() === window.rootLevelCommentatorTab) {
        await openCommentsPanelToAlias(aliasId, true);
    }
}

// B"H - Correctly exposing getters so aiThread.js can access them
window.commentLogic = { 
    handleNewComment,
    reloadRoot,
    getCurrentVerse,
    getCurrentSub
};

removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);