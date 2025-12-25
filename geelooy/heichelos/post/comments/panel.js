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

export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined, allowFallback = true) {
    if (!window.post || !window.post.heichel) return [];
    
    const s = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : (s.get("idx") ?? "root");
    
    let subSection = forcedSub !== undefined ? forcedSub : s.get("sub");
    if(subSection === null) subSection = undefined; 

    const fetchAliases = async (vs, ss) => {
        const cacheKey = `${vs}-${ss ?? 'all'}-${allowFallback}`;
        if (!forceFresh && data.aliases?.[cacheKey]) {
            return data.aliases[cacheKey].aliases;
        }

        try {
            const result = await getCommentsByAlias({
                seriesId: window.post.parentSeriesId, postId: window.post.id, heichelId: window.post.heichel.id,
                fromCache: !forceFresh, get: { verseSection: vs, subSection: ss, map: true }
            });
            if (Array.isArray(result)) {
                if (!data.aliases) data.aliases = {};
                data.aliases[cacheKey] = { aliases: result, lastModified: Date.now() };
                return result;
            }
        } catch (e) { console.error("Error fetching aliases:", e); }
        return [];
    };

    let aliases = await fetchAliases(verseSection, subSection);

    if (allowFallback && aliases.length === 0 && subSection !== undefined) {
        aliases = await fetchAliases(verseSection, null);
    }

    return full ? aliases : aliases.map(w => w?.id || w);
}

export async function updateCommentHeader() {
    const s = new URLSearchParams(location.search);
    const sub = s.get("sub");
	var aliases = await getAndSaveAliases();
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
    // B"H - Clear immediately to prevent stale state visuals
    actualTab.innerHTML = "";
    
    makeAddCommentSection(actualTab);

    const aiRow = document.createElement("div");
    aiRow.className = "awtsmoos-list-item ai-card";
    aiRow.innerHTML = `
        <div style="display:flex; flex-direction:column;">
            <span style="font-weight:700; font-size:16px; color:#007bff; display:flex; align-items:center; gap:6px;">
                ✨ Ask Awtsmoos AI
            </span>
            <span style="font-weight:400; font-size:12px; color:#666; margin-top:4px;">
                Explore deeper meaning with AI
            </span>
        </div>
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
    // Add loading indicator
    commentorList.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">Loading...</div>`;
    actualTab.appendChild(commentorList);
    
    var aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    
    // Clear loading
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
            <div style="font-size: 40px; margin-bottom: 10px; opacity: 0.5;">📖</div>
            ${hasSub ? "No commentaries on this paragraph." : "No commentaries found here."} <br>
            ${hasSub ? "" : "Be the first to illuminate this path! B\"H."}
        `;
        
        if (hasSub) {
            const btn = document.createElement("button");
            btn.className = "btn secondary";
            btn.style.marginTop = "15px";
            btn.innerText = "Show All Verse Comments";
            btn.onclick = async () => {
                const verseAliases = await getAndSaveAliases(false, false, null, null, false);
                if(verseAliases && verseAliases.length > 0) {
                    renderAliasesList(verseAliases, commentorList);
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
                    width:36px; height:36px; 
                    background:linear-gradient(135deg, #e0e0e0, #f5f5f5); 
                    border-radius:50%; display:flex; align-items:center; justify-content:center;
                    font-weight:bold; color:#555; font-size:14px;
                    border:1px solid #ddd;
                ">${initial}</div>
                <div style="display:flex; flex-direction:column;">
                    <span style="color:#333; font-weight:700;">@${alias}</span>
                    <span style="font-size:11px; color:#888;">Tap to view comments</span>
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
            <div style="font-size: 30px; margin-bottom: 10px; opacity: 0.5;">⚖️</div>
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
