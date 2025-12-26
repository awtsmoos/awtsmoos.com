//B"H
/**
 * Inline Threading Logic.
 * Purged of obsolete JS-based CSS injectors.
 */
import { updateQueryStringParameter } from "../../functions/utils.js";
import { makeInlineComment } from "../render.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { isAliasInline } from "./state.js";
import { registerFork } from "../render/ai/structure.js"; 

/**
 * @method renderThreadContent
 * @description B"H - Populates the inline thread container.
 */
export async function renderThreadContent(threadContainer, idx, sub) {
    threadContainer.innerHTML = `<div class="thread-loading">Gathering revelations...</div>`;
    
    const addControls = () => {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thread-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            threadContainer.style.opacity = '0';
            setTimeout(() => threadContainer.remove(), 300);
            updateQueryStringParameter("cid", null);
            updateQueryStringParameter("mid", null);
        };
        threadContainer.appendChild(closeBtn);

        if(window.curAlias) {
            const newThreadBtn = document.createElement("button");
            newThreadBtn.className = "btn primary small";
            newThreadBtn.innerText = "Start New Thread";
            newThreadBtn.style.margin = "0 0 15px 15px";
            newThreadBtn.onclick = async () => {
                const { openAIChat } = await import("../../ai/chat.js");
                updateQueryStringParameter("idx", idx);
                if(sub !== null) updateQueryStringParameter("sub", sub);
                openAIChat(); 
            };
            threadContainer.appendChild(newThreadBtn);
        }
    };

    const { getAndSaveAliases } = await import("../panel.js");
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    threadContainer.innerHTML = ""; 
    addControls();

    if (!aliases || aliases.length === 0) {
        threadContainer.innerHTML += `<div class="thread-empty">No commentaries found here. Start one?</div>`;
        return;
    }

    let foundAny = false;
    for (const alias of aliases) {
        if (isAliasInline(alias)) {
            const aliasGroup = document.createElement("div");
            aliasGroup.className = "thread-alias-group";
            aliasGroup.innerHTML = `
                <div class="thread-alias-header">@${alias}</div>
                <div style="font-size:12px; color:#666; padding: 5px; font-style:italic;">
                    (Currently reading inline below)
                </div>
            `;
            threadContainer.appendChild(aliasGroup);
            foundAny = true;
            continue;
        }

        const allVerseComments = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId,
            postId: window?.post?.id,
            heichelId: window?.post?.heichel.id,
            aliasId: alias,
            fromCache: false, 
            get: { verseSection: idx, map: true } 
        });
        
        let relevant = [];
        if (Array.isArray(allVerseComments)) {
            relevant = allVerseComments.filter(c => {
                let d = c.dayuh || {};
                const cSub = d.subSection;
                if (sub === null || sub === undefined) {
                    return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
                } else {
                    return String(cSub) === String(sub);
                }
            });
        }

        if (relevant.length > 0) {
            foundAny = true;
            const aliasGroup = document.createElement("div");
            aliasGroup.className = "thread-alias-group";
            aliasGroup.innerHTML = `<div class="thread-alias-header">@${alias}</div>`;
            
            const forks = [];
            const roots = [];

            relevant.forEach(c => {
                c.id = String(c.id);
                let d = c.dayuh || {};
                c.dayuh = d;
                const contentStr = (typeof c.content === 'string') ? c.content.trim() : "";
                const isFork = !!(c.forkedFrom || d.forkedFrom || contentStr.startsWith("Fork from") || contentStr.startsWith("Branch:"));

                if (isFork) {
                    if(!c.dayuh.forkedFrom && c.forkedFrom) c.dayuh.forkedFrom = c.forkedFrom;
                    forks.push(c);
                } else {
                    roots.push(c);
                }
            });

            roots.forEach(c => {
                const incom = makeInlineComment(alias, c);
                aliasGroup.appendChild(incom);
            });
            forks.forEach(c => registerFork(c));
            threadContainer.appendChild(aliasGroup);
        }
    }
    
    if (!foundAny) {
        threadContainer.innerHTML += `<div class="thread-empty">No commentaries specifically on this section.</div>`;
    }
}

export async function showSectionCommentaryInline(idx, sub, targetEl) {
    if (!targetEl || !targetEl.querySelector) {
        const sel = (sub !== null && sub !== undefined) 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${sub}']` 
            : `.section[data-awtsmoos-idx='${idx}']`;
        targetEl = document.querySelector(sel);
        if (!targetEl) return console.error("Target element not found for candle");
    }

    const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
    const threadId = `${idx}-${subKey}`;
    const parentContainer = targetEl.parentNode;
    const existing = parentContainer ? parentContainer.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${threadId}"]`) : null;

    if (existing) {
        existing.style.opacity = '0';
        existing.style.transform = 'translateY(-10px) scale(0.98)';
        setTimeout(() => existing.remove(), 250); 
        updateQueryStringParameter("cid", null);
        updateQueryStringParameter("mid", null);
        return;
    }

    const threadContainer = document.createElement("div");
    threadContainer.className = 'awtsmoos-inline-thread';
    threadContainer.dataset.uniqueThread = threadId;
    
    if (sub !== null && sub !== undefined) {
        const indicatorEl = targetEl.querySelector('.awtsmoos-comment-indicator');
        if (indicatorEl) indicatorEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    } else {
        const textContentEl = targetEl.querySelector('.toichen');
        if (textContentEl) textContentEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    }

    await renderThreadContent(threadContainer, idx, sub);
}