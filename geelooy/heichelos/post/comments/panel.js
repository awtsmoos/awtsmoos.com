
//B"H
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { getCurrentVerse, getCurrentSub } from "./state.js";

// Import Refactored Modules
import { getAndSaveAliases as fetchAliases, fetchRelevantComments } from "./panel/fetching.js";
import { makeCommentatorList as renderCommentatorList, renderControlsAndComments } from "./panel/rendering.js";

// Export for other modules to use
export { getAndSaveAliases } from "./panel/fetching.js";

export async function loadRootComments({ parent, tab }) {
    console.log("B\"H - loadRootComments called");
	window.tabComment = tab;
	window.tabParent = parent;
	window.rootLevelCommentatorTab = tab;
    
    tab.awtsmoosType = "main commentator list";

	parent.innerHTML = "";
	await updateCommentHeader();
	await makeCommentatorList(parent, tab);
}

// Delegate to rendering module
export async function makeCommentatorList(actualTab, tabObj, forceFresh = false) {
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

export async function openCommentsOfAlias({ alias, actualTab, post, all=false }) {
	await showAllComments({ tab: actualTab, post, alias, withCurrentVerse: !all });
}

export async function showAllComments({ alias, post, tab, withCurrentVerse = true }) {
	var cv = getCurrentVerse();
    var cs = getCurrentSub();
	
    let coms = await fetchRelevantComments(alias, cv, cs);
    
	if (!Array.isArray(coms) || coms.length === 0) {
        let contextMsg = (cs !== null && cs !== undefined) ? "this paragraph" : "this verse";
		tab.innerHTML = `<div style="padding:40px 20px; text-align:center; color:#888;">
            No comments from @${alias} on ${contextMsg}.
        </div>`;
        
        if (cs !== null && cs !== undefined) {
            const btn = document.createElement("button");
            btn.className = "btn secondary";
            btn.style.marginTop = "10px";
            btn.innerText = "Check Entire Verse";
            btn.onclick = async () => {
                // Fetch verse-level comments (ignoring sub-section)
                const verseComsRaw = await getCommentsOfAlias({
                    seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, aliasId: alias,
                    fromCache: true, get: { verseSection: cv, map: true }
                });
                
                const verseComs = Array.isArray(verseComsRaw) 
                    ? verseComsRaw.filter(c => {
                        // Safe check for subSection absence
                        let d = c.dayuh;
                        if(typeof d !== 'object' || !d) d = {};
                        const cSub = d.subSection;
                        return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
                    })
                    : [];

                if(verseComs && verseComs.length > 0) {
                    tab.innerHTML = "";
                    renderControlsAndComments(verseComs, alias, tab);
                } else {
                    btn.innerText = "No verse comments either";
                    btn.disabled = true;
                }
            };
            tab.lastChild.appendChild(btn);
        }
		return;
	}

    renderControlsAndComments(coms, alias, tab);
}

export async function openCommentsPanelToAlias(alias, open=true) {
    if(window.reloadRoot) await window.reloadRoot(); 
    if(open && window.openPanel) window.openPanel();
    
    const tabs = window.tabManager.getTabs();
    if(tabs.length === 1) {
        return new Promise(resolve => {
            window.tabManager.addTab({
                header: "@" + alias,
                content: "Loading...",
                async onopen({actualTab, tab}) {
                     tab.awtsmoosType = "specific alias comments";
                     window.currentAliasTabContainer = actualTab; 
                     window.currentAliasBeingViewed = alias;
                     await openCommentsOfAlias({ alias, actualTab, post: window.post });
                     resolve(actualTab);
                }
            }).open();
        });
    }
    
    const current = window.tabManager.getCurrent();
    if(current && window.currentAliasBeingViewed === alias) {
         await openCommentsOfAlias({ alias, actualTab: current.actual, post: window.post });
         return current.actual;
    }
	return null; 
}
