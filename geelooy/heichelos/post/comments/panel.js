// /BH/awtsmoos.com/geelooy/heichelos/post/comments/panel.js
//B"H
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { getCurrentVerse, getCurrentSub } from "./state.js";
import { getAndSaveAliases as fetchAliases, fetchRelevantComments } from "./panel/fetching.js";
import { makeCommentatorList as renderCommentatorList, renderControlsAndComments } from "./panel/rendering.js";

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
    if (sub !== null) {
        headerText = (aliases.length) + " Commentators (Verse " + (curVerseDisplay) + ", Para " + (+sub + 1) + ")";
    }

    if(window.tabComment && window.tabComment.onUpdateHeader) {
	    window.tabComment.onUpdateHeader(headerText);
    }
}

export async function openCommentsOfAlias({ alias, actualTab, post, all = false }) {
	await showAllComments({ tab: actualTab, post, alias, all });
}

export async function showAllComments({ alias, post, tab, all = false }) {
	var cv = getCurrentVerse();
    var cs = getCurrentSub();
	
    let coms;
    if (all) {
        // B"H - TOTAL SEARCH: Fetch ALL comments for this user on this post.
        coms = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, 
            aliasId: alias, fromCache: false, get: { all: true }
        });
    } else {
        // Standard context-sensitive search.
        coms = await fetchRelevantComments(alias, cv, cs);
    }
    
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
            content: "Loading...",
            async onopen({ actualTab, tab }) {
                 tab.awtsmoosType = "specific alias comments";
                 window.currentAliasTabContainer = actualTab; 
                 window.currentAliasBeingViewed = alias;
                 await openCommentsOfAlias({ alias, actualTab, post: window.post, all: searchAll });
                 resolve(actualTab);
            }
        }).open();
    });
}

window.openCommentsPanelToAlias = openCommentsPanelToAlias;
