// /BH/awtsmoos.com/geelooy/heichelos/post/comments/panel/rendering.js
//B"H
import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment, renderTreeItem } from "../render.js";
import { isAliasInline, toggleInlineForComments } from "../inline.js";
import { openAIChat } from "../../ai/chat.js";
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
        openAIChat();
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
        row.dataset.alias = alias;
        
        const isInline = isAliasInline(alias);
        const initial = alias.charAt(0).toUpperCase();

        row.innerHTML = `
            <div class="commentator-info">
                <div class="commentator-avatar">${initial}</div>
                <span class="commentator-name">@${alias}</span>
            </div>
            <div class="commentator-actions">
                 <div class="inline-toggle-wrapper" title="Read Inline">
                    <input type="checkbox" id="inline-toggle-${alias}" class="inline-toggle-input" data-alias="${alias}" ${isInline ? 'checked' : ''}>
                    <label for="inline-toggle-${alias}" class="inline-toggle-label"></label>
                </div>
                <span class="awtsmoos-list-item-arrow">→</span>
            </div>
        `;

        row.querySelector('.commentator-info').onclick = () => {
            window.tabManager.addTab({
                header: "@" + alias,
                name: "user-" + alias,
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

        row.querySelector('.inline-toggle-input').addEventListener('change', (e) => {
            // Pass a dummy comments object; the function will fetch the correct full list.
            toggleInlineForComments([], e.target.dataset.alias);
        });

        container.appendChild(row);
    });
}

export function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    
    // B"H - No more global "Read Inline" button. It's now a per-commentator toggle.
    
    const treeRoots = buildCommentTree(coms);
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list";
    
    treeRoots.forEach(node => {
        renderTreeItem(node, listContainer, (c) => makeHTMLFromComment(c), 'sidebar');
    });
    
    tab.appendChild(listContainer);
}
