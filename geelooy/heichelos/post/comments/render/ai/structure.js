//B"H
/**
 * AI Branching Thread Structure.
 * Purged of obsolete JS-based CSS injectors.
 * REFORGED with unbreakable Event Delegation.
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
export function renderBranchingThread(parentElement, commentData, commentId, options = {}) {
    const { isInline = false } = options;

    const threadWrapper = document.createElement("div");
    threadWrapper.className = "ai-thread-wrapper";
    threadWrapper.dataset.commentId = commentId; 
    
    // B"H - Default to minimized for inline views
    if (isInline) {
        threadWrapper.classList.add("minimized");
    }
    
    // --- Header Construction ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "ai-thread-header";
    
    const titleText = commentData.content || "AI Transmission";
    const titleSpan = document.createElement("span");
    titleSpan.className = "ai-title";
    titleSpan.innerHTML = `<span class="ai-icon">✨</span> ${markdownToHtml(sanitizeComment(titleText))}`;
    
    const controls = document.createElement("div");
    controls.className = "ai-controls-row";

    const minBtn = createHeaderBtn(isInline ? "[+]" : "[-]", "Minimize", "minimize");
    const viewFullBtn = createHeaderBtn("↗", "Focus View", "focus-view");

    controls.append(minBtn, viewFullBtn);
    headerDiv.append(titleSpan, controls);
    threadWrapper.appendChild(headerDiv);
    
    // --- Preview for Minimized State ---
    const previewDiv = document.createElement("div");
    previewDiv.className = "ai-thread-preview";
    const firstUserMsg = commentData.dayuh.conversation?.find(m => m.role === 'user');
    if (firstUserMsg) {
        previewDiv.innerHTML = `<span>USER:</span> ${sanitizeComment(firstUserMsg.text).substring(0, 100)}...`;
    }
    threadWrapper.appendChild(previewDiv);


    // --- Timeline ---
    const threadContainer = document.createElement("div");
    threadContainer.className = "ai-thread-timeline root-timeline";
    
    renderThreadSequence(threadContainer, commentData.dayuh.conversation, commentData, commentId, 0, true);

    threadWrapper.appendChild(threadContainer);
    
    // --- B"H - SOVEREIGN EVENT DELEGATION ---
    threadWrapper.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        e.stopPropagation();
        const action = actionTarget.dataset.action;

        switch (action) {
            case 'minimize':
                const isMinimized = threadWrapper.classList.toggle("minimized");
                actionTarget.innerText = isMinimized ? "[+]" : "[-]";
                break;
            
            case 'focus-view':
                if (window.openCommentsPanelToAlias) {
                    window.openCommentsPanelToAlias(commentData.author).then(() => {
                        setTimeout(() => {
                            const el = document.querySelector(`.comment-content[data-cid="${commentId}"]`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 500);
                    });
                }
                break;
        }
    });

    parentElement.appendChild(threadWrapper);
}

function createHeaderBtn(text, title, actionName) {
    const btn = document.createElement("button");
    btn.className = "ai-header-btn";
    btn.innerText = text;
    btn.title = title;
    btn.dataset.action = actionName; // For delegation
    return btn;
}
