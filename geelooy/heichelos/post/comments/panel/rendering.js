
//B"H
import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment } from "../render.js";
import { isAliasInline, toggleInlineForComments } from "../inline.js";
import { registerFork } from "../render/ai/structure.js";
import { renderAIChat } from "../../ai/chat.js";
import { openCommentsOfAlias } from "../panel.js"; 
import { getAndSaveAliases } from "./fetching.js"; 

export { renderFootnotesPanel } from "./footnotes.js"; // Re-export

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

export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    makeAddCommentSection(actualTab);

    // AI Card
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

/**
 * B"H - Renders the comment list. 
 * STRICT SEPARATION: Roots render immediately. Forks go to the waiting room.
 * REVISED: Standard forks are manually nested into parent's .children-slot
 */
export function renderControlsAndComments(coms, alias, tab) {
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
    
    const roots = [];
    const forks = [];

    coms.forEach(c => {
        c.id = String(c.id);
        if (typeof c.dayuh === 'string') {
             try { c.dayuh = JSON.parse(c.dayuh); } catch(e) { c.dayuh = {}; }
        }
        let d = c.dayuh || {};
        c.dayuh = d; 
        
        const contentStr = (typeof c.content === 'string') ? c.content.trim() : "";
        
        const isFork = !!(
            c.forkedFrom || 
            d.forkedFrom ||
            d.replyToId || // Standard replies use this
            contentStr.startsWith("Fork from") || 
            contentStr.startsWith("Branch:")
        );
        
        if (isFork) {
            // Normalization
            if(!c.dayuh.forkedFrom) {
                if(d.replyToId) {
                     c.dayuh.forkedFrom = { commentId: d.replyToId };
                } else {
                    c.dayuh.forkedFrom = c.forkedFrom || {
                        author: "Unknown", 
                        msgIndex: 0 
                    };
                }
            }
            forks.push(c);
        } else {
            roots.push(c);
        }
    });

    // 1. Render all ROOT comments normally
    const sortedRoots = [...roots].sort((a, b) => {
             const tA = parseInt(a.id.split('_')[1]) || 0;
             const tB = parseInt(b.id.split('_')[1]) || 0;
             return tB - tA; 
    });

    sortedRoots.forEach(c => {
        makeHTMLFromComment({ comment: c, aliasId: alias, tab });
    });

    // 2. Handle Forks (Nesting)
    // If it's an AI thread, register it for structure.js
    // If it's a standard reply, nest it manually in the panel
    forks.forEach(f => {
        const parentId = f.dayuh.forkedFrom?.commentId;
        const parentEl = tab.querySelector(`.comment-content[data-cid="${parentId}"] .children-slot`);
        
        if (parentEl) {
            // Found parent in DOM, nest it!
            makeHTMLFromComment({ comment: f, aliasId: alias, tab: parentEl });
        } else {
            // Parent not found or it's an AI fork that needs structure.js logic
            registerFork(f);
        }
    });
}
