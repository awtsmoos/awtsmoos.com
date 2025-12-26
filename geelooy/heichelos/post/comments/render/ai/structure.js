//B"H
/**
 * AI Branching Thread Structure.
 * Purged of obsolete JS-based CSS injectors.
 */
import { sanitizeComment } from "../utils.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { renderThreadSequence, renderNestedThread } from "./thread.js";
import { processPendingForks, registerFork } from "./branching.js";

// Re-export for external use
export { registerFork, processPendingForks };

/**
 * @method renderBranchingThread
 * @description B"H - Initiates the visual timeline for an AI thread.
 */
export function renderBranchingThread(parentElement, commentData, commentId) {
    const threadWrapper = document.createElement("div");
    threadWrapper.className = "ai-thread-wrapper";
    threadWrapper.dataset.commentId = commentId; 
    
    // --- Header Construction ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "ai-thread-header";
    
    const titleText = commentData.content || "AI Transmission";
    const titleSpan = document.createElement("span");
    titleSpan.className = "ai-title";
    titleSpan.innerHTML = `<span class="ai-icon">✨</span> ${markdownToHtml(sanitizeComment(titleText))}`;
    
    const controls = document.createElement("div");
    controls.className = "ai-controls-row";

    const minBtn = createHeaderBtn("[-]", "Minimize", (e) => {
        threadWrapper.classList.toggle("minimized");
        minBtn.innerText = threadWrapper.classList.contains("minimized") ? "[+]" : "[-]";
    });

    const viewFullBtn = createHeaderBtn("↗", "Focus View", async (e) => {
        if(window.openCommentsPanelToAlias) {
            await window.openCommentsPanelToAlias(commentData.author);
            setTimeout(() => {
                const el = document.querySelector(`.comment-content[data-cid="${commentId}"]`);
                if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
            }, 500);
        }
    });

    controls.append(minBtn, viewFullBtn);
    headerDiv.append(titleSpan, controls);
    threadWrapper.appendChild(headerDiv);

    // --- Timeline ---
    const threadContainer = document.createElement("div");
    threadContainer.className = "ai-thread-timeline root-timeline";
    
    renderThreadSequence(threadContainer, commentData.dayuh.conversation, commentData, commentId, 0, true);

    threadWrapper.appendChild(threadContainer);
    parentElement.appendChild(threadWrapper);
}

function createHeaderBtn(text, title, onClick) {
    const btn = document.createElement("button");
    btn.className = "ai-header-btn";
    btn.innerText = text;
    btn.title = title;
    btn.onclick = (e) => { e.stopPropagation(); onClick(e); };
    return btn;
}