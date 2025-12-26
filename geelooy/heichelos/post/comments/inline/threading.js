//B"H
/**
 * Inline Threading Logic - Sovereignty & Union Edition.
 * Handles the manifestation of both AI and Human insights within the reading flow.
 */
import { updateQueryStringParameter } from "../../functions/utils.js";
import { makeInlineComment } from "../render.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { isAliasInline } from "./state.js";
import { registerFork } from "../render/ai/structure.js"; 

/**
 * @method renderThreadContent
 * @description B"H - Populates the inline thread with high-intensity controls and commentaries.
 */
export async function renderThreadContent(threadContainer, idx, sub) {
    threadContainer.innerHTML = `
        <div class="thread-loading">
            <div class="loading-bar"></div>
            <span>DRAWING FORTH REVELATIONS...</span>
        </div>
    `;
    
    const addControls = (isEmpty = false) => {
        // --- THE SOVEREIGN X ---
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thread-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            threadContainer.classList.add('manifest-closing');
            updateQueryStringParameter("idx", null);
            updateQueryStringParameter("sub", null);
            updateQueryStringParameter("cid", null);
            if(window.chai) window.chai.deselectAll();
            if(window.subChai) window.subChai.deselectAll();
            setTimeout(() => threadContainer.remove(), 250);
        };
        threadContainer.appendChild(closeBtn);

        // --- THE DUAL PORTAL ---
        if(window.curAlias) {
            const portalWrapper = document.createElement("div");
            portalWrapper.className = isEmpty ? "thread-hero-portal" : "thread-compact-portal";
            
            if (isEmpty) {
                portalWrapper.innerHTML = `<div class="empty-msg-text">No commentaries found here. Start one</div>`;
            }

            const btnRow = document.createElement("div");
            btnRow.className = "portal-btn-row";

            // Path 1: Human Insight
            const humanBtn = document.createElement("button");
            humanBtn.className = "btn primary portal-btn human-path";
            humanBtn.innerHTML = "<span>WRITE HUMAN INSIGHT</span>";
            humanBtn.onclick = async (e) => {
                e.stopPropagation();
                const { CommentSection } = await import("../../CommentSection.js");
                const entryPoint = document.createElement("div");
                entryPoint.className = "inline-comment-entry-point";
                
                // B"H - Anchor the input locally
                portalWrapper.after(entryPoint);
                const cs = new CommentSection(entryPoint);
                
                // Auto-trigger the box focus
                setTimeout(() => {
                    const box = entryPoint.querySelector('.comment-box');
                    if(box) {
                        box.style.display = 'block';
                        box.focus();
                        entryPoint.querySelector('.add-comment').style.display = 'none';
                    }
                }, 50);

                humanBtn.disabled = true;
            };

            // Path 2: AI Transception
            const aiBtn = document.createElement("button");
            aiBtn.className = "btn secondary portal-btn ai-path";
            aiBtn.innerHTML = "<span>ASK AWTSMOOS AI</span>";
            aiBtn.onclick = async (e) => {
                e.stopPropagation();
                const { openAIChat } = await import("../../ai/chat.js");
                updateQueryStringParameter("idx", idx);
                if(sub !== null) updateQueryStringParameter("sub", sub);
                openAIChat(); 
            };

            btnRow.append(humanBtn, aiBtn);
            portalWrapper.appendChild(btnRow);
            threadContainer.appendChild(portalWrapper);
        }
    };

    const { getAndSaveAliases } = await import("../panel.js");
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    threadContainer.innerHTML = ""; 
    
    if (!aliases || aliases.length === 0) {
        addControls(true);
        return;
    }

    addControls(false); 

    let foundAny = false;
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "thread-scroll-area";

    for (const alias of aliases) {
        if (isAliasInline(alias)) {
            const aliasGroup = document.createElement("div");
            aliasGroup.className = "thread-alias-group";
            aliasGroup.innerHTML = `
                <div class="thread-alias-header">@${alias}</div>
                <div class="inline-reading-status">Reading inline in text flow.</div>
            `;
            scrollContainer.appendChild(aliasGroup);
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
                const contentStr = (typeof c.content === 'string') ? c.content.trim() : "";
                const isFork = !!(c.forkedFrom || (c.dayuh || {}).forkedFrom || contentStr.startsWith("Fork") || contentStr.startsWith("Branch"));

                if (isFork) {
                    registerFork(c);
                } else {
                    const incom = makeInlineComment(alias, c);
                    aliasGroup.appendChild(incom);
                }
            });
            scrollContainer.appendChild(aliasGroup);
        }
    }
    
    if (foundAny) {
        threadContainer.appendChild(scrollContainer);
    } else {
        threadContainer.innerHTML = "";
        addControls(true);
    }
}

/**
 * @method showSectionCommentaryInline
 * @description B"H - Triggers the manifesting of the inline thread container.
 */
export async function showSectionCommentaryInline(idx, sub, targetEl) {
    if (!targetEl || !targetEl.querySelector) {
        const sel = (sub !== null && sub !== undefined) 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${sub}']` 
            : `.section[data-awtsmoos-idx='${idx}']`;
        targetEl = document.querySelector(sel);
        if (!targetEl) return;
    }

    const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
    const threadId = `${idx}-${subKey}`;
    const existing = document.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${threadId}"]`);

    if (existing) {
        existing.querySelector('.thread-close-btn')?.click();
        return;
    }

    // Single-thread focus mode
    document.querySelectorAll('.awtsmoos-inline-thread').forEach(t => t.querySelector('.thread-close-btn')?.click());

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

    setTimeout(() => threadContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    await renderThreadContent(threadContainer, idx, sub);
}
