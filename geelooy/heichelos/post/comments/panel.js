//B"H
import { getCommentsByAlias, getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment } from "./render.js";
import { isAliasInline, toggleInlineForComments } from "./inline.js";
import { getCurrentVerse, getCurrentSub, data } from "./state.js";
import { indexSwitch, reloadRoot } from "/heichelos/post/commentLogic.js";
import { renderAIChat } from "../ai/chat.js";

var curTab = null;

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

/**
 * @method getAndSaveAliases
 * @description Retrieves list of aliases commenting on the current section.
 */
export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined, allowFallback = true) {
    if (!window.post || !window.post.heichel) return [];
    
    const s = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : (s.get("idx") ?? "root");
    
    let subSection = forcedSub !== undefined ? forcedSub : s.get("sub");
    if(subSection === null) subSection = undefined; 

    // 1. Fetch ALL aliases for the VERSE
    const fetchVerseAliases = async (vs) => {
        const cacheKey = `${vs}-verse-all`;
        if (!forceFresh && data.aliases?.[cacheKey]) {
            return data.aliases[cacheKey].aliases;
        }
        try {
            const result = await getCommentsByAlias({
                seriesId: window.post.parentSeriesId, 
                postId: window.post.id, 
                heichelId: window.post.heichel.id,
                fromCache: !forceFresh, 
                get: { verseSection: vs, map: true } 
            });
            if (Array.isArray(result)) {
                if (!data.aliases) data.aliases = {};
                data.aliases[cacheKey] = { aliases: result, lastModified: Date.now() };
                return result;
            }
        } catch (e) { console.error("Error fetching aliases:", e); }
        return [];
    };

    let verseAliases = await fetchVerseAliases(verseSection);

    // 2. If a sub-section IS active, filter the verse aliases
    if (subSection !== undefined) {
        const filteredAliases = [];
        const checks = verseAliases.map(async (aliasId) => {
            try {
                const comments = await getCommentsOfAlias({
                    seriesId: window.post.parentSeriesId,
                    postId: window.post.id,
                    heichelId: window.post.heichel.id,
                    aliasId: aliasId,
                    fromCache: true,
                    get: { verseSection: verseSection, map: true }
                });
                
                if (Array.isArray(comments)) {
                    const hasSubComment = comments.some(c => String(c?.dayuh?.subSection) === String(subSection));
                    if (hasSubComment) return aliasId;
                }
            } catch(e) {}
            return null;
        });
        
        const results = await Promise.all(checks);
        const activeInSub = results.filter(Boolean);
        
        if (activeInSub.length > 0) {
            return full ? activeInSub : activeInSub; 
        }
        
        // 3. Fallback
        if (allowFallback) {
            const generalChecks = verseAliases.map(async (aliasId) => {
                 const comments = await getCommentsOfAlias({
                    seriesId: window.post.parentSeriesId, postId: window.post.id, heichelId: window.post.heichel.id,
                    aliasId: aliasId, fromCache: true, get: { verseSection: verseSection, map: true }
                });
                if(Array.isArray(comments)) {
                    const hasGeneral = comments.some(c => 
                        c.dayuh?.subSection === undefined || 
                        c.dayuh?.subSection === null || 
                        c.dayuh?.subSection === 'main' || 
                        c.dayuh?.subSection === 'root'
                    );
                    if(hasGeneral) return aliasId;
                }
                return null;
            });
            const generalAliases = (await Promise.all(generalChecks)).filter(Boolean);
            return full ? generalAliases : generalAliases;
        }
        
        return [];
    }

    return full ? verseAliases : verseAliases;
}

export async function updateCommentHeader() {
    const s = new URLSearchParams(location.search);
    const sub = s.get("sub");
	var aliases = await getAndSaveAliases(false, false, null, undefined, false); 
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

export function makeAddCommentSection(par) {
	var div = document.createElement("div");
	div.classList.add("comment-section");
    div.style.margin = "0";
    div.style.borderBottom = "1px solid #eee";
    div.style.borderRadius = "0";
    div.style.boxShadow = "none";
	par.appendChild(div);
	new CommentSection(div);
}

export async function makeCommentatorList(actualTab, tabObj, forceFresh = false) {
    actualTab.innerHTML = "";
    
    makeAddCommentSection(actualTab);

    // B"H - Simplified AI Card (Just a clean list item)
    const aiRow = document.createElement("div");
    aiRow.className = "awtsmoos-list-item ai-card";
    aiRow.innerHTML = `
        <span style="font-weight:600; display:flex; align-items:center; gap:8px;">
            ✨ Ask Awtsmoos AI
        </span>
        <span class="awtsmoos-list-item-arrow">&#8250;</span>
    `;
    aiRow.onclick = () => {
        window.tabManager.addTab({
            header: "Awtsmoos AI",
            content: "",
            async onopen({ actualTab: chatTab }) {
                renderAIChat({ tab: chatTab });
            }
        }).open();
    };
    actualTab.appendChild(aiRow);

    var commentorList = document.createElement("div");
    commentorList.className = "commentors-list";
    commentorList.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">Loading...</div>`;
    actualTab.appendChild(commentorList);
    
    var aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    
    commentorList.innerHTML = "";

    if (!aliases || !Array.isArray(aliases) || aliases.length === 0) {
        const s = new URLSearchParams(location.search);
        const hasSub = s.get("sub") !== null;
        
        const empty = document.createElement("div");
        empty.style.padding = "40px 20px";
        empty.style.textAlign = "center";
        empty.style.color = "#999";
        empty.style.fontStyle = "italic";
        empty.innerHTML = `
            ${hasSub ? "No commentaries on this paragraph." : "No commentaries found here."}
        `;
        
        if (hasSub) {
            const btn = document.createElement("button");
            btn.className = "btn secondary";
            btn.style.marginTop = "15px";
            btn.innerText = "Show All Verse Comments";
            btn.onclick = async () => {
                const allVerse = await getAndSaveAliases(false, false, null, null, false);
                if(allVerse && allVerse.length > 0) {
                    renderAliasesList(allVerse, commentorList);
                } else {
                    btn.innerText = "No verse comments either";
                    btn.disabled = true;
                }
            };
            empty.appendChild(btn);
        }
        
        commentorList.appendChild(empty);
        return;
    }

    renderAliasesList(aliases, commentorList);
}

function renderAliasesList(aliases, container) {
    container.innerHTML = "";
    aliases.forEach(alias => {
        const row = document.createElement("div");
        row.className = "awtsmoos-list-item";
        const initial = alias.charAt(0).toUpperCase();
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="
                    width:32px; height:32px; 
                    background:#f3f4f6; 
                    border-radius:50%; display:flex; align-items:center; justify-content:center;
                    font-weight:600; color:#555; font-size:13px;
                    border:1px solid #e5e7eb;
                ">${initial}</div>
                <div style="display:flex; flex-direction:column;">
                    <span style="color:#333; font-weight:500; font-size:14px;">@${alias}</span>
                </div>
            </div>
            <span class="awtsmoos-list-item-arrow">&#8250;</span>
        `;
        row.onclick = () => {
            window.tabManager.addTab({
                header: "@" + alias,
                content: `<div class="center loading" style="padding:20px;">Loading comments...</div>`,
                async onopen({ actualTab: aliasContentArea, tab }) { 
                    tab.awtsmoosType = "specific alias comments";
                    window.currentAliasTabContainer = aliasContentArea; 
                    window.currentAliasBeingViewed = alias;
                    await openCommentsOfAlias({ 
                        alias: alias, 
                        actualTab: aliasContentArea, 
                        post: window.post 
                    });
                }
            }).open();
        };
        container.appendChild(row);
    });
}

export async function openCommentsOfAlias({ alias, actualTab, post, all=false }) {
	await showAllComments({ tab: actualTab, post, alias, withCurrentVerse: !all });
}

export async function showAllComments({ alias, post, tab, withCurrentVerse = true }) {
	var cv = getCurrentVerse();
    var cs = getCurrentSub();
	
    const fetchComs = async () => {
        const allVerseComments = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, aliasId: alias,
            fromCache: true, get: { verseSection: cv, map: true }
        });
        
        if (!Array.isArray(allVerseComments)) return [];

        return allVerseComments.filter(c => {
            const cSub = c.dayuh?.subSection;
            if (cs === null || cs === undefined) {
                return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
            } else {
                return String(cSub) === String(cs);
            }
        });
    };

    let coms = await fetchComs();
    
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
                const verseComsRaw = await getCommentsOfAlias({
                    seriesId: window?.post?.parentSeriesId, postId: post.id, heichelId: post.heichel.id, aliasId: alias,
                    fromCache: true, get: { verseSection: cv, map: true }
                });
                
                const verseComs = Array.isArray(verseComsRaw) 
                    ? verseComsRaw.filter(c => {
                        const cSub = c.dayuh?.subSection;
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

function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
	var controls = document.createElement("div");
    controls.style.padding = "10px";
    controls.style.borderBottom = "1px solid #eee";
    controls.style.textAlign = "right";

	var ri = document.createElement("button");
	ri.className = "btn secondary";
    ri.style.padding = "4px 8px";
    ri.style.fontSize = "12px";
	ri.textContent = isAliasInline(alias) ? "Hide Inline" : "Read Inline";
	ri.onclick = () => {
		toggleInlineForComments(coms, alias);
		ri.textContent = isAliasInline(alias) ? "Hide Inline" : "Read Inline";
	};
    controls.appendChild(ri);
	tab.appendChild(controls);
    
    coms.forEach(c => makeHTMLFromComment({ comment: c, aliasId: alias, tab }));
}

export async function openCommentsPanelToAlias(alias, open=true) {
    await reloadRoot(); 
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
