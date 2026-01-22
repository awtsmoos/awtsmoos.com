// /BH/awtsmoos.com/geelooy/heichelos/post/comments/panel/rendering.js
//B"H
import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment, renderTreeItem } from "../render.js";
import { isAliasInline, toggleInlineForComments } from "../inline.js";
import { renderAIChat } from "../../ai/chat.js";
import { openCommentsOfAlias } from "../panel.js"; 
import { getAndSaveAliases } from "./fetching.js"; 

export { renderFootnotesPanel } from "./footnotes.js"; 

// Helper: Build Tree Structure (Duplicate for modular isolation)
function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => { map[c.id] = { comment: c, children: [] }; });
    comments.forEach(c => {
        const node = map[c.id];
        const dayuh = c.dayuh || {};
        const parentId = dayuh.replyToId || dayuh.forkedFrom?.commentId;
        if (parentId && map[parentId]) map[parentId].children.push(node);
        else roots.push(node);
    });
    roots.sort((a, b) => parseInt(a.comment.id.split('_')[1]) - parseInt(b.comment.id.split('_')[1]));
    return roots;
}

export function makeAddCommentSection(par) {
	var div = document.createElement("div");
	div.classList.add("comment-section");
    div.style.margin = "0";
    div.style.borderBottom = "1px solid #eee";
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
        <span style="font-weight:900; display:flex; align-items:center; gap:8px;">
            ✨ ASK AWTSMOOS AI
        </span>
        <span class="awtsmoos-list-item-arrow">→</span>
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
    commentorList.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">Loading Revelations...</div>`;
    actualTab.appendChild(commentorList);
    
    var aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    
    commentorList.innerHTML = "";

    if (!aliases || !Array.isArray(aliases) || aliases.length === 0) {
        const s = new URLSearchParams(location.search);
        const hasSub = s.get("sub") !== null;
        
        const empty = document.createElement("div");
        empty.style.padding = "40px 20px";
        empty.style.textAlign = "center";
        empty.style.color = "var(--color-ink-secondary)";
        empty.style.fontWeight = "700";
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
                    width:36px; height:36px; 
                    background:var(--color-ink); 
                    color:var(--bg-surface);
                    display:flex; align-items:center; justify-content:center;
                    font-weight:900; font-size:14px;
                    border:2px solid var(--color-ink);
                ">${initial}</div>
                <div style="display:flex; flex-direction:column;">
                    <span style="color:var(--color-ink); font-weight:900; font-size:16px;">@${alias}</span>
                </div>
            </div>
            <span class="awtsmoos-list-item-arrow">→</span>
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

export function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    
	var controls = document.createElement("div");
    controls.style.padding = "15px";
    controls.style.borderBottom = "4px solid var(--color-ink)";
    controls.style.textAlign = "right";
    controls.style.background = "var(--bg-vellum)";

	var ri = document.createElement("button");
    let isInline = isAliasInline(alias);
    
    const updateBtn = () => {
        ri.className = isInline ? "btn" : "btn secondary";
        ri.style.width = "100%";
        ri.style.fontWeight = "900";
        ri.style.textTransform = "uppercase";
        ri.innerHTML = isInline ? "📖 Hide from Text" : "📖 Read Inline";
    };
    updateBtn();
    
	ri.onclick = () => {
		toggleInlineForComments(coms, alias);
        isInline = isAliasInline(alias);
        updateBtn();
        setTimeout(() => renderControlsAndComments(coms, alias, tab), 50);
	};
    
    controls.appendChild(ri);
	tab.appendChild(controls);
    
    // B"H - NEW TREE LOGIC
    const treeRoots = buildCommentTree(coms);
    
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list";
    listContainer.style.padding = "10px";
    
    // Render the tree using the shared factory
    treeRoots.forEach(node => {
        renderTreeItem(node, listContainer, (c) => makeHTMLFromComment(c), 'sidebar');
    });
    
    tab.appendChild(listContainer);
}