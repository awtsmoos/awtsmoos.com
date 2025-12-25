
//B"H
import { injectAIChatCSS } from "/heichelos/post/styles/aiChatStyles.js";
import { sanitizeComment } from "../utils.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { createMessageNode, createThreadContainer } from "./components.js";
import { toggleBranchInput, renderInlineTerminal } from "./input.js";

/* -------------------------------------------------------------------------- */
/*                            STRUCTURE / RENDERING                           */
/* -------------------------------------------------------------------------- */

const pendingForks = [];

export function registerFork(commentData) {
    if (!pendingForks.some(f => f.id === commentData.id)) {
        pendingForks.push(commentData);
    }
    processPendingForks();
}

export function processPendingForks() {
    if (pendingForks.length === 0) return;

    const remaining = [];
    let processedAny = false;

    const allThreads = Array.from(document.querySelectorAll('.ai-thread-wrapper, .ai-nested-thread'));
    const anyActiveThread = allThreads.length > 0 ? allThreads[0] : null;

    pendingForks.forEach(fork => {
        let parentId = fork.dayuh?.forkedFrom?.commentId;
        const msgIdx = fork.dayuh?.forkedFrom?.msgIndex ?? 0;
        
        if (!parentId && anyActiveThread) {
            parentId = anyActiveThread.dataset.commentId || anyActiveThread.dataset.nestedId;
        }

        if (!parentId) {
            remaining.push(fork);
            return;
        }

        const parentThread = document.querySelector(
            `.ai-thread-wrapper[data-comment-id="${parentId}"], .ai-nested-thread[data-nested-id="${parentId}"]`
        );
        
        if (!parentThread) {
            remaining.push(fork);
            return;
        }
        
        const timeline = parentThread.querySelector(":scope > .ai-branch-content > .ai-thread-timeline, :scope > .ai-thread-timeline");
        
        if (!timeline) {
            remaining.push(fork);
            return;
        }
        
        let block = timeline.querySelector(`:scope > .ai-thread-block[data-msg-index="${msgIdx}"]`);
        
        if (!block) {
             const blocks = timeline.querySelectorAll(":scope > .ai-thread-block");
             if(blocks.length > 0) block = blocks[blocks.length - 1];
        }
        
        if (block) {
            let slot = block.querySelector(":scope > .ai-forks-slot");
            if (!slot) {
                slot = document.createElement("div");
                slot.className = "ai-forks-slot";
                block.appendChild(slot);
            }

            const existing = slot.querySelector(`.ai-nested-thread[data-nested-id="${fork.id}"]`);
            if (!existing) {
                renderNestedThread(slot, fork, fork.id);
                processedAny = true;
            }
        } else {
            remaining.push(fork);
        }
    });

    pendingForks.length = 0;
    pendingForks.push(...remaining);
    
    if(processedAny) {
        processPendingForks();
    }
}

export function renderBranchingThread(parentElement, commentData, commentId) {
    injectAIChatCSS();
    
    const threadWrapper = document.createElement("div");
    threadWrapper.className = "ai-thread-wrapper";
    threadWrapper.dataset.commentId = commentId; 
    
    // --- Global Header ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "ai-thread-header";
    
    const titleText = commentData.content || "AI Transmission";
    const titleSpan = document.createElement("span");
    titleSpan.className = "ai-title";
    titleSpan.innerHTML = `<span class="ai-icon">✨</span> ${markdownToHtml(sanitizeComment(titleText))}`;
    
    const controls = document.createElement("div");
    controls.className = "ai-controls-row";

    const minBtn = document.createElement("button");
    minBtn.className = "ai-header-btn";
    minBtn.innerText = "[-]";
    minBtn.title = "Minimize Entire Chat";
    minBtn.onclick = (e) => {
        e.stopPropagation();
        threadWrapper.classList.toggle("minimized");
        minBtn.innerText = threadWrapper.classList.contains("minimized") ? "[+]" : "[-]";
    };

    const viewFullBtn = document.createElement("button");
    viewFullBtn.className = "ai-header-btn";
    viewFullBtn.innerHTML = "↗";
    viewFullBtn.title = "Focus View";
    viewFullBtn.onclick = async (e) => {
        e.stopPropagation();
        if(window.openCommentsPanelToAlias) {
            await window.openCommentsPanelToAlias(commentData.author);
            setTimeout(() => {
                const el = document.querySelector(`.comment-content[data-cid="${commentId}"]`);
                if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
            }, 500);
        }
    };

    controls.appendChild(minBtn);
    controls.appendChild(viewFullBtn);
    
    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(controls);
    threadWrapper.appendChild(headerDiv);

    const threadContainer = createThreadContainer("ai-thread-timeline root-timeline");
    
    renderThreadSequence(threadContainer, commentData.dayuh.conversation, commentData, commentId, 0, true);

    threadWrapper.appendChild(threadContainer);
    parentElement.appendChild(threadWrapper);
}

function renderThreadSequence(container, history, commentData, commentId, startIndex = 0, isInteractive = false) {
    if (!history) return;

    for (let i = startIndex; i < history.length; i++) {
        const msg = history[i];
        
        // B"H - Allow interaction if logged in
        const canInteract = !!window.curAlias;
        const isOwner = (window.curAlias && window.curAlias === commentData.author);

        const block = createMessageNode(msg, i, {
            isOwner,
            canInteract, // Passed to allow Reply button
            onFork: (forkSlot) => {
                toggleBranchInput(forkSlot, {
                    index: i,
                    historySnapshot: history,
                    originalAuthor: commentData.author,
                    parentData: commentData,
                    parentId: commentId
                }, {
                    renderNewThread: (slot, newData, newId) => renderNestedThread(slot, newData, newId, true) 
                });
            }
        });

        container.appendChild(block);
    }

    // Only the owner of the *branch* sees the terminal at the bottom to continue linearly
    // OTHERS see a button to fork/reply to the end
    const isOwner = window.curAlias && window.curAlias === commentData.author;
    
    if (isInteractive) {
        if (isOwner) {
            renderInlineTerminal(container, history, commentId, commentData);
        } else if (window.curAlias) {
            // Render "Reply to Thread" button for non-owners to continue linearly (via fork)
            const replyDiv = document.createElement("div");
            replyDiv.style.padding = "10px 0 10px 40px"; // Align with content
            replyDiv.className = "ai-fork-reply-container";
            
            const replyBtn = document.createElement("button");
            replyBtn.className = "ai-btn ai-btn-primary";
            replyBtn.innerText = "Reply to Chat";
            replyBtn.onclick = () => {
                // Remove button, show input in its place
                replyDiv.innerHTML = "";
                // Treat as branching from the last message
                const lastIdx = history.length - 1;
                toggleBranchInput(replyDiv, {
                    index: lastIdx,
                    historySnapshot: history,
                    originalAuthor: commentData.author,
                    parentData: commentData,
                    parentId: commentId
                }, {
                    renderNewThread: (slot, newData, newId) => renderNestedThread(slot, newData, newId, true)
                });
            };
            replyDiv.appendChild(replyBtn);
            container.appendChild(replyDiv);
        }
    }

    setTimeout(() => processPendingForks(), 100);
}

export function renderNestedThread(container, commentData, commentId, forceOpen = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-nested-thread";
    wrapper.dataset.nestedId = commentId;

    const trigger = document.createElement("div");
    trigger.className = "ai-branch-trigger";
    
    let previewText = "New Reality";
    if(commentData.dayuh.conversation && commentData.dayuh.conversation.length > 0) {
        const parentMsgIndex = commentData.dayuh.forkedFrom.msgIndex;
        const newMsgIndex = parentMsgIndex + 1;
        
        if(commentData.dayuh.conversation[newMsgIndex]) {
             previewText = commentData.dayuh.conversation[newMsgIndex].text.substring(0, 30) + "...";
        } else {
             previewText = (commentData.dayuh.conversation[commentData.dayuh.conversation.length - 1]?.text || "").substring(0, 30) + "...";
        }
    }
    
    trigger.innerHTML = `<span class="ai-branch-icon">⑂</span> <span>Branch by @${commentData.author}: "${previewText}"</span>`;
    
    const content = document.createElement("div");
    content.className = "ai-branch-content";
    content.style.display = forceOpen ? "block" : "none";
    if(forceOpen) trigger.classList.add("active");

    const timelineContainer = createThreadContainer("ai-thread-timeline nested-timeline");
    
    let startIdx = 0;
    if (commentData.dayuh.forkedFrom && typeof commentData.dayuh.forkedFrom.msgIndex === 'number') {
        startIdx = commentData.dayuh.forkedFrom.msgIndex + 1;
    }
    
    renderThreadSequence(timelineContainer, commentData.dayuh.conversation, commentData, commentId, startIdx, true);
    content.appendChild(timelineContainer);

    trigger.onclick = (e) => {
        e.stopPropagation();
        const isClosed = content.style.display === "none";
        content.style.display = isClosed ? "block" : "none";
        trigger.classList.toggle("active", isClosed);
        
        if (isClosed) {
            processPendingForks();
        }
    };

    wrapper.appendChild(trigger);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
}
