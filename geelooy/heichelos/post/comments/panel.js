//B"H
import { getCommentsByAlias, getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { addTab } from "/heichelos/post/postFunctions.js";
import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment } from "./render.js";
import { isAliasInline, toggleInlineForComments } from "./inline.js";
import { getCurrentVerse, data } from "./state.js";
import { indexSwitch, reloadRoot } from "/heichelos/post/commentLogic.js";
import { renderAIChat } from "../ai/chat.js";

var curTab = null;

export async function loadRootComments({ parent, tab }) {
	window.tabComment = tab;
	window.tabParent = parent;
	window.rootLevelCommentatorTab = tab;
	parent.innerHTML = "";
	await updateCommentHeader();
	await makeCommentatorList(tabParent, rootLevelCommentatorTab);
}

export async function getAndSaveAliases(full = false, forceFresh = false) {
    if (!window.post || !window.post.heichel) return [];
    
    var s = new URLSearchParams(location.search);
    var verseSection = s.get("idx") ? parseInt(s.get("idx")) : "root";

    if (!data.aliases) data.aliases = {};
    if (!forceFresh && data.aliases[verseSection]) {
        const cachedData = data.aliases[verseSection].aliases;
        if (Array.isArray(cachedData)) return full ? cachedData : cachedData.map(w => w?.id || w);
    }

    var aliases = [];
    try {
        const result = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId, postId: window.post.id, heichelId: window.post.heichel.id,
            fromCache: false, get: { verseSection, map: true }
        });
        if (Array.isArray(result)) aliases = result;
    } catch (error) { console.error("Error fetching aliases:", error); }

    data.aliases[verseSection] = { aliases, lastModified: Date.now() };
    return full ? aliases : aliases.map(w => w?.id || w);
}

export async function updateCommentHeader() {
	var aliases = await getAndSaveAliases();
	var cv = getCurrentVerse();
	var curVerseDisplay = cv === "root" ? "Post" : +cv + 1;
	window?.tabComment?.onUpdateHeader((aliases.length) + " Commentators for verse: " + (curVerseDisplay));
}

export function makeAddCommentSection(par) {
	var div = document.createElement("div");
	div.classList.add("comment-section");
	par.appendChild(div);
	new CommentSection(div);
}

export async function makeCommentatorList(actualTab, tab) {
    actualTab.innerHTML = "";
    
    // AI Chat Button
    var aiBtn = document.createElement("div");
    aiBtn.className = "btn add-comment";
    aiBtn.style.marginBottom = "10px";
    aiBtn.style.width = "calc(100% - 40px)";
    aiBtn.style.marginLeft = "20px";
    aiBtn.style.marginRight = "20px";
    aiBtn.style.textAlign = "center";
    aiBtn.style.background = "linear-gradient(135deg, #6e8efb, #a777e3)";
    aiBtn.style.color = "white";
    aiBtn.style.fontWeight = "bold";
    aiBtn.style.cursor = "pointer";
    aiBtn.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    aiBtn.innerText = "✨ Ask Awtsmoos AI";
    aiBtn.onclick = () => {
        addTab({
            header: "Awtsmoos AI",
            btnParent: tab.awtsTabBtn.parentNode, // Ensure it's in the same tab list
            parent: window.mainParent,
            tabParent: tab,
            async onopen({ actualTab: chatTab }) {
                curTab = tab; // Keep context
                renderAIChat({ tab: chatTab });
            },
            async onclose() {
                // Return to list
            }
        }).open();
    };
    actualTab.appendChild(aiBtn);

    makeAddCommentSection(actualTab);

    var commentorList = document.createElement("div");
    commentorList.classList.add("commentors");
    actualTab.appendChild(commentorList);
    
    var aliases = await getAndSaveAliases();
    curTab = tab; window.curTab = curTab;
	curTab.awtsmoosType = "main commentator list";
	
    if (!aliases || !Array.isArray(aliases) || aliases.length === 0) {
        commentorList.innerHTML = "Be the first to comment on this verse!";
        return [];
    }

    var tabs = [];
    aliases.forEach(alias => {
        var newTab = addTab({
            header: "@" + alias,
            btnParent: commentorList,
			parent: window.mainParent,
			tabParent: tab,
			content: `<div class="center loading"><div class="loading-circle"></div></div>`,
			async onopen({ actualTab: aliasContentArea }) { 
				curTab = newTab; window.curTab = curTab;
				curTab.awtsmoosType = "specific alias comments";
				window.currentAliasTabContainer = aliasContentArea; 
				window.currentAliasBeingViewed = alias;
				openCommentsOfAlias({ alias: window.currentAliasBeingViewed, actualTab: window.currentAliasTabContainer, post: window.post });
			},
			async onclose() {
				window.currentAliasTabContainer = null;
				await makeCommentatorList(window.tabParent, window.rootLevelCommentatorTab);
			}
        });
        tabs.push(newTab);
    });
    return tabs;
}

export async function openCommentsOfAlias({ alias, actualTab, post, all=false }) {
	var commentors = actualTab.querySelector(".commentors");
	if(commentors) actualTab = commentors;
	await showAllComments({ tab: actualTab, post, alias, withCurrentVerse: !all });
	var ld = actualTab.querySelector(".loading");
	if(ld) ld.parentNode.removeChild(ld);
}

export async function showAllComments({ alias, post, tab, withCurrentVerse = true }) {
	var cv = getCurrentVerse();
	var s = new URLSearchParams(location.search);
	var subSec = s.get("sub") ? parseInt(s.get("sub")) : null;
	var coms = await getCommentsOfAlias({
		seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, aliasId: alias,
		fromCache: true, get: { verseSection: cv, map: true }
	});

	if (!Array.isArray(coms) || coms.length === 0) {
		tab.innerHTML = "No comments yet from this user on this verse.";
		return;
	}

	tab.innerHTML = "";
	var ri = document.createElement("div");
	ri.className = "btn";
	ri.textContent = isAliasInline(alias) ? "Hide inline" : "Read inline";
	ri.onclick = () => {
		toggleInlineForComments(coms, alias);
		ri.textContent = isAliasInline(alias) ? "Hide inline" : "Read inline";
	};
	tab.appendChild(ri);

    coms.forEach(c => makeHTMLFromComment({ comment: c, aliasId: alias, tab }));
}

export async function openCommentsPanelToAlias(alias, open=true) {
	await reloadRoot(); 
	var tabs = window.tabManager.getTabs();
    var tab = tabs.find(q => q.awtsHeader.textContent.trim().substring(1) == alias);
	if(!tab) return null;
	tab?.open();
	if(open && window.openPanel) window.openPanel();
	return tab;
}