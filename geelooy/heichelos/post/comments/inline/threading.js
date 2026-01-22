//B"H
/**
 * Inline Threading Logic - Sovereignty & Union Edition.
 * Handles the manifestation of both AI and Human insights within the reading flow.
 * RE-FORGED for CSS GRID architecture.
 */
import { updateQueryStringParameter } from "../../functions/utils.js";
import { makeInlineComment } from "../render.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { isAliasInline } from "./state.js";
import { registerFork } from "../render/ai/structure.js"; 

/**
 * @method renderThreadContent
 * @description B"H - Populates the marginal gloss with high-intensity controls and commentaries.
 */
export async function renderThreadContent(threadContainer, idx, sub) {
    threadContainer.innerHTML = `
        <div class="thread-loading" style="font-size:12px; color: var(--color-ink-secondary);">
            Loading Revelations...
        </div>
    `;
    
    const addControls = (isEmpty = false) => {
        // --- Close Button ---
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thread-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = "Close Insight Panel";
        closeBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            document.getElementById('realPost')?.classList.remove('has-gloss');
            threadContainer.remove();
            
            updateQueryStringParameter("idx", null);
            updateQueryStringParameter("sub", null);
            updateQueryStringParameter("cid", null);
        };
        threadContainer.appendChild(closeBtn);

        // --- The Collapsed Portal ---
        if(window.curAlias) {
            const portalWrapper = document.createElement("div");
            portalWrapper.className = "thread-portal";
            
            if (isEmpty) {
                portalWrapper.innerHTML = `<div class="empty-msg-text">No commentaries found here.</div>`;
            }

            const btnRow = document.createElement("div");
            btnRow.className = "portal-btn-row collapsed";

            const expandBtn = document.createElement("button");
            expandBtn.className = "btn expand-portal-btn";
            expandBtn.innerHTML = "+ Add Insight";
            
            const humanBtn = document.createElement("button");
            humanBtn.className = "btn portal-btn human-path";
            humanBtn.innerHTML = "Human";
            humanBtn.onclick = async (e) => {
                e.stopPropagation();
                const { CommentSection } = await import("../../CommentSection.js");
                const entryPoint = document.createElement("div");
                entryPoint.className = "inline-comment-entry-point";
                portalWrapper.after(entryPoint);
                new CommentSection(entryPoint);
                setTimeout(() => {
                    entryPoint.querySelector('.add-comment')?.click();
                }, 50);
                humanBtn.disabled = true;
                aiBtn.style.display = 'none';
                expandBtn.style.display = 'none';
            };

            const aiBtn = document.createElement("button");
            aiBtn.className = "btn portal-btn ai-path";
            aiBtn.innerHTML = "AI";
            aiBtn.onclick = async (e) => {
                e.stopPropagation();
                const { openAIChat } = await import("../../ai/chat.js");
                updateQueryStringParameter("idx", idx);
                if(sub !== null) updateQueryStringParameter("sub", sub);
                openAIChat(); 
            };
            
            expandBtn.onclick = () => {
                btnRow.classList.remove('collapsed');
                expandBtn.style.display = 'none';
            };

            btnRow.append(expandBtn, humanBtn, aiBtn);
            portalWrapper.appendChild(btnRow);
            threadContainer.appendChild(portalWrapper);
        }
    };

    const { getAndSaveAliases } = await import("../panel.js");
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    threadContainer.innerHTML = ""; 
    
    addControls(!aliases || aliases.length === 0); 

    if (!aliases || aliases.length === 0) return;

    let foundAny = false;
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "thread-scroll-area";

    for (const alias of aliases) {
        if (isAliasInline(alias)) continue;

        const allVerseComments = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId, postId: window?.post?.id, heichelId: window?.post?.heichel.id,
            aliasId: alias, fromCache: false, get: { verseSection: idx, map: true } 
        });
        
        let relevant = (Array.isArray(allVerseComments) ? allVerseComments : []).filter(c => {
            const cSub = c?.dayuh?.subSection;
            if (sub === null || sub === undefined) {
                return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
            } else {
                return String(cSub) === String(sub);
            }
        });

        if (relevant.length > 0) {
            foundAny = true;
            const aliasGroup = document.createElement("div");
            aliasGroup.className = "thread-alias-group";
            aliasGroup.innerHTML = `<div class="thread-alias-header">@${alias}</div>`;
            
            relevant.forEach(c => {
                c.id = String(c.id);
                registerFork(c);
                const incom = makeInlineComment(alias, c);
                aliasGroup.appendChild(incom);
            });
            scrollContainer.appendChild(aliasGroup);
        }
    }
    
    if (foundAny) {
        threadContainer.appendChild(scrollContainer);
    }
}

/**
 * @method showSectionCommentaryInline
 * @description B"H - Triggers the manifesting of the marginal gloss within the CSS Grid.
 */
export async function showSectionCommentaryInline(idx, sub, targetEl) {
    // Single-thread focus mode: close all others
    document.querySelectorAll('.awtsmoos-inline-thread .thread-close-btn').forEach(btn => btn.click());
    
    const realPost = document.getElementById('realPost');
    if (!realPost) return;

    const threadContainer = document.createElement("div");
    threadContainer.className = 'awtsmoos-inline-thread';
    
    // B"H - Place the thread container and command the grid to make space.
    realPost.appendChild(threadContainer);
    realPost.classList.add('has-gloss');

    setTimeout(() => {
        // Scroll the main content area to bring the target element into view
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    await renderThreadContent(threadContainer, idx, sub);
}
