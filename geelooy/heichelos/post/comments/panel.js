
/**
 * B"H
 * @module SidebarCommentPanel
 * @chapter Deep-Dive into Aliases
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { getCurrentVerse, getCurrentSub } from "./state.js";
import { getAndSaveAliases as fetchAliases, fetchRelevantComments } from "./panel/fetching.js";
import { makeCommentatorList as renderCommentatorList, renderControlsAndComments } from "./panel/rendering.js";
import { unrollApiResponse } from "./logic/unroller.js";

export { getAndSaveAliases } from "./panel/fetching.js";

export async function loadRootComments({ parent, tab }) {
	window.tabComment = tab;
	window.tabParent = parent;
	window.rootLevelCommentatorTab = tab;
    tab.awtsmoosType = "main commentator list";
	parent.innerHTML = "";
	await updateCommentHeader();
	await makeCommentatorList(parent, tab);
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
    return await renderCommentatorList(actualTab, forceFresh);
}

export async function updateCommentHeader() {
    const s = new URLSearchParams(location.search);
    const sub = s.get("sub");
	var aliases = await fetchAliases(false, false, null, undefined, false); 
	var cv = getCurrentVerse();
	var curVerseDisplay = cv === "root" ? "Post" : +cv + 1;
    
    let headerText = (aliases.length) + " Commentators (Verse " + (curVerseDisplay) + ")";
    if (sub !== null && sub !== "null") {
        headerText = (aliases.length) + " Commentators (Verse " + (curVerseDisplay) + ", Para " + (+sub + 1) + ")";
    }

    if(window.tabComment && window.tabComment.onUpdateHeader) {
	    window.tabComment.onUpdateHeader(headerText);
    }
}

/**
 * @method showAllComments
 * @description Fetches all insights for a user, perfectly unrolling any API wrappers.
 */
export async function showAllComments({ alias, post, tab, all = false }) {
	var cv = getCurrentVerse();
    var cs = getCurrentSub();
	
    let result;
    if (all) {
        // B"H - ABSOLUTE SEARCH: Tearing all veils.
        result = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, 
            aliasId: alias, fromCache: false, get: { all: true }
        });
    } else {
        // Targeted inclusive coordinate search
        const relevant = await fetchRelevantComments(alias, cv, cs);
        return renderControlsAndComments(relevant, alias, tab);
    }

    // B"H - UNROLL VEIL
    let coms = unrollApiResponse(result);
    
	if (!Array.isArray(coms) || coms.length === 0) {
        let contextMsg = (cs !== null && cs !== undefined) ? "this paragraph" : "this verse";
		tab.innerHTML = `<div class="awtsmoos-empty-placeholder">No comments from @${alias} on ${contextMsg}.</div>`;
		return;
	}

    renderControlsAndComments(coms, alias, tab);
}

export async function openCommentsPanelToAlias(alias, open = true, searchAll = false) {
    if (open && window.toggleSidebar) window.toggleSidebar(true);
    
    const current = window.tabManager.getCurrent();
    if (current && window.currentAliasBeingViewed === alias && !searchAll) {
         await openCommentsOfAlias({ alias, actualTab: current.actual, post: window.post, all: false });
         return current.actual;
    }

    return new Promise(resolve => {
        window.tabManager.addTab({
            header: "@" + alias,
            name: "user-" + alias,
            content: "<div class='loading'>B\"H Fetching insights...</div>",
            async onopen({ actualTab, tab }) {
                 tab.awtsmoosType = "specific alias comments";
                 window.currentAliasTabContainer = actualTab; 
                 window.currentAliasBeingViewed = alias;
                 await openCommentsOfAlias({ alias, actualTab: actualTab, post: window.post, all: searchAll });
                 resolve(actualTab);
            }
        }).open();
    });
}

export async function openCommentsOfAlias({ alias, actualTab, post, all = false }) {
	await showAllComments({ tab: actualTab, post, alias, all });
}

window.openCommentsPanelToAlias = openCommentsPanelToAlias;
