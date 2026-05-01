
/**
 * B"H
 * @module SidebarRenderingScribe
 * @chapter The Assembly of the Insight-Keepers
 * @description
 * Every commentator is a portal to a deeper dimension of the text. 
 * This module manifests the list of these Keepers. 
 * REFORGED: The entire vessel is now a sensitive portal.
 */

import { CommentSection } from "/heichelos/post/CommentSection.js";
import { makeHTMLFromComment, renderTreeItem } from "/heichelos/post/comments/render.js";
import { isAliasInline, toggleInlineForComments } from "/heichelos/post/comments/inline.js";
import { openAIChat } from "/heichelos/post/ai/chat.js";
import { openCommentsOfAlias } from "/heichelos/post/comments/panel.js"; 
import { getAndSaveAliases } from "/heichelos/post/comments/panel/fetching.js"; 
import { buildCommentTree } from "../logic/treeBuilder.js";

/**
 * @method makeAddCommentSection
 * @description Manifests the transcription altar.
 */
export function makeAddCommentSection(par) {
	var div = document.createElement("div");
	div.classList.add("comment-section-container");
    div.style.padding = "20px";
    div.style.borderBottom = "4px solid var(--color-ink)";
	par.appendChild(div);
	new CommentSection(div);
}

/**
 * @method makeCommentatorList
 * @description The ritual to manifest the Council of Keepers.
 */
export async function makeCommentatorList(actualTab, forceFresh = false) {
    actualTab.innerHTML = "";
    makeAddCommentSection(actualTab);

    // B"H - AI ORACLE GATEWAY
    const aiRow = document.createElement("div");
    aiRow.className = "awtsmoos-list-item ai-monolith";
    aiRow.innerHTML = `
        <div class="keeper-content">
            <span class="keeper-icon">✨</span>
            <span class="keeper-name">ASK AWTSMOOS AI</span>
        </div>
        <span class="keeper-arrow">→</span>
    `;
    aiRow.onclick = () => openAIChat();
    actualTab.appendChild(aiRow);

    const keepersWrap = document.createElement("div");
    keepersWrap.className = "keepers-assembly";
    actualTab.appendChild(keepersWrap);
    
    const aliases = await getAndSaveAliases(false, forceFresh, null, undefined, false);
    if (!aliases || aliases.length === 0) {
        keepersWrap.innerHTML = `<div class="assembly-void-msg">The chambers are currently silent.</div>`;
        return;
    }

    aliases.forEach(alias => {
        const row = document.createElement("div");
        row.className = "awtsmoos-list-item keeper-card";
        row.dataset.alias = alias;
        
        const isInline = isAliasInline(alias);
        const initial = alias.charAt(0).toUpperCase();

        // B"H - STRUCTURE: We divide the card into the Touch-Zone and the Control-Zone
        row.innerHTML = `
            <div class="keeper-portal-trigger" title="Enter insights of @${alias}">
                <div class="commentator-avatar">${initial}</div>
                <span class="commentator-name">@${alias}</span>
            </div>
            <div class="keeper-controls">
                 <div class="inline-toggle-altar" title="Manifest insights in the text">
                    <input type="checkbox" id="inline-toggle-${alias}" class="inline-toggle-input" ${isInline ? 'checked' : ''}>
                    <label for="inline-toggle-${alias}" class="inline-toggle-label"></label>
                </div>
                <span class="keeper-arrow">→</span>
            </div>
        `;

        // 1. Navigation Ritual (The Whole Trigger Zone)
        const trigger = row.querySelector('.keeper-portal-trigger');
        trigger.onclick = (e) => {
            e.stopPropagation();
            window.tabManager.addTab({
                header: "@" + alias,
                name: "user-" + alias,
                content: `<div class="loading-ink">Seeking records of @${alias}...</div>`,
                async onopen({ actualTab: contentArea, tab }) { 
                    tab.awtsmoosType = "specific alias comments";
                    window.currentAliasTabContainer = contentArea; 
                    window.currentAliasBeingViewed = alias;
                    await openCommentsOfAlias({ alias, actualTab: contentArea, post: window.post });
                }
            }).open();
        };

        // 2. Inline Manifestation Ritual (Specific to the switch)
        const checkbox = row.querySelector('.inline-toggle-input');
        checkbox.onclick = (e) => e.stopPropagation(); // Stop navigation trigger
        checkbox.onchange = (e) => {
            toggleInlineForComments([], alias);
        };

        keepersWrap.appendChild(row);
    });
}

/**
 * @method renderControlsAndComments
 */
export function renderControlsAndComments(coms, alias, tab) {
    tab.innerHTML = "";
    const treeRoots = buildCommentTree(coms);
    const listContainer = document.createElement("div");
    listContainer.className = "sidebar-comment-list";
    treeRoots.forEach(node => {
        renderTreeItem(node, listContainer, (c) => makeHTMLFromComment(c), 'sidebar');
    });
    tab.appendChild(listContainer);
}
