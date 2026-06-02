
/**
 * B"H
 * @module InlineThreadingLogic
 * @chapter Marginal Manifestation
 */

import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeInlineComment } from "/heichelos/post/comments/render.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { isAliasInline } from "/heichelos/post/comments/inline/state.js";
import { registerFork } from "/heichelos/post/comments/render/ai/structure.js"; 

export async function renderThreadContent(threadContainer, idx, sub) {
    threadContainer.innerHTML = '<div class="thread-loading">Gathering Revelations...</div>';
    
    const addControls = (isEmpty = false) => {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thread-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            document.querySelectorAll('.commentary-focus').forEach(el => el.classList.remove('commentary-focus'));
            threadContainer.remove();
            updateQueryStringParameter("idx", null);
            updateQueryStringParameter("sub", null);
        };
        threadContainer.appendChild(closeBtn);

        if(window.curAlias) {
            const portal = document.createElement("div");
            portal.className = "thread-portal";
            if (isEmpty) portal.innerHTML = '<div class="empty-msg awtsmoos-empty-placeholder">No insights manifest here.</div>';

            const btnRow = document.createElement("div");
            btnRow.className = "portal-btn-row";
            
            const createBtn = (txt, cls, ritual) => {
                const b = document.createElement("button");
                b.className = `btn portal-btn ${cls}`;
                b.innerHTML = txt;
                b.onclick = ritual;
                return b;
            };

            const humanRitual = async () => {
                const { CommentSection } = await import("/heichelos/post/CommentSection.js");
                const entry = document.createElement("div");
                entry.className = "inline-comment-entry comment-content";
                portal.after(entry);
                new CommentSection(entry, { autoReveal: true });
                btnRow.remove();
            };

            const aiRitual = async () => {
                const { openAIChat } = await import("/heichelos/post/ai/chat.js");
                updateQueryStringParameter("idx", idx);
                if(sub !== null) updateQueryStringParameter("sub", sub);
                openAIChat(); 
            };

            btnRow.append(createBtn("Human Insight", "human-path", humanRitual), createBtn("AI Oracle", "ai-path", aiRitual));
            portal.appendChild(btnRow);
            threadContainer.appendChild(portal);
        }
    };

    const { getAndSaveAliases } = await import("/heichelos/post/comments/panel.js");
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    threadContainer.innerHTML = ""; 
    addControls(!aliases || aliases.length === 0); 

    if (!aliases || aliases.length === 0) return;

    const scrollArea = document.createElement("div");
    scrollArea.className = "thread-scroll-area";

    for (const alias of aliases) {
        if (isAliasInline(alias)) continue;

        let result = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, 
            postId: window?.post?.id, 
            heichelId: window?.post?.heichel.id,
            aliasId: alias, 
            fromCache: false, 
            get: { verseSection: idx, map: true } 
        });
        
        const rawComments = (result && result.success) ? result.success : result;
        
        let relevant = (Array.isArray(rawComments) ? rawComments : []).filter(c => {
            const cSub = c?.dayuh?.subSection;
            
            // Sync Inclusive Filtering Logic
            if (sub === null || sub === undefined || sub === "null") {
                return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
            } else {
                const isMatch = String(cSub) === String(sub);
                const isGeneral = (cSub === undefined || cSub === null || cSub === 'main');
                return isMatch || isGeneral;
            }
        });

        if (relevant.length > 0) {
            const group = document.createElement("div");
            group.className = "thread-alias-group";
            group.innerHTML = `<div class="thread-alias-header">@${alias}</div>`;
            relevant.forEach(c => {
                c.id = String(c.id);
                registerFork(c); 
                group.appendChild(makeInlineComment(c));
            });
            scrollArea.appendChild(group);
        }
    }
    
    threadContainer.appendChild(scrollArea);
}

export async function showSectionCommentaryInline(idx, sub, targetEl) {
    document.querySelectorAll('.awtsmoos-inline-thread').forEach(el => el.remove());
    document.querySelectorAll('.commentary-focus').forEach(el => el.classList.remove('commentary-focus'));
    
    if (targetEl) {
        targetEl.classList.add('commentary-focus');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const threadContainer = document.createElement("div");
    threadContainer.className = "awtsmoos-inline-thread";
    threadContainer.dataset.uniqueThread = `${idx}-${sub}`;

    const context = document.querySelector('.post-reader-localized-context') || document.body;
    context.appendChild(threadContainer);
    
    await renderThreadContent(threadContainer, idx, sub);
}
