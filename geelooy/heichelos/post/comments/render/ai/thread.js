//B"H
import { createMessageNode } from "./components.js";
import { renderInlineTerminal, toggleBranchInput } from "./input.js";
import { processPendingForks } from "./branching.js";

// Circular dependency resolution via dynamic import or passing callback
// We will use a recursive callback pattern for nesting.

export function renderThreadSequence(container, history, commentData, commentId, startIndex = 0, isInteractive = false) {
    if (!history) return;

    for (let i = startIndex; i < history.length; i++) {
        const msg = history[i];
        const canInteract = !!window.curAlias;
        const isOwner = (window.curAlias && window.curAlias === commentData.author);

        const block = createMessageNode(msg, i, {
            isOwner,
            canInteract,
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

    // Interaction Zone
    const isOwner = window.curAlias && window.curAlias === commentData.author;
    
    if (isInteractive) {
        if (isOwner) {
            renderInlineTerminal(container, history, commentId, commentData);
        } else if (window.curAlias) {
            // Reply Button for Non-Owners
            const replyDiv = document.createElement("div");
            replyDiv.style.padding = "10px 0 10px 40px";
            replyDiv.className = "ai-fork-reply-container awtsmoos-card";
            
            const replyBtn = document.createElement("button");
            replyBtn.className = "ai-btn ai-btn-primary btn awtsmoos-hero-btn";
            replyBtn.innerText = "Reply to Chat";
            replyBtn.onclick = () => {
                replyDiv.innerHTML = "";
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
    wrapper.className = "ai-nested-thread awtsmoos-card";
    wrapper.dataset.nestedId = commentId;

    const trigger = document.createElement("div");
    trigger.className = "ai-branch-trigger awtsmoos-list-item";
    
    let previewText = "New Reality";
    if(commentData.dayuh.conversation && commentData.dayuh.conversation.length > 0) {
        const parentMsgIndex = commentData.dayuh.forkedFrom?.msgIndex ?? 0;
        const newMsgIndex = parentMsgIndex + 1;
        
        if(commentData.dayuh.conversation[newMsgIndex]) {
             previewText = commentData.dayuh.conversation[newMsgIndex].text.substring(0, 30) + "...";
        } else {
             previewText = (commentData.dayuh.conversation[commentData.dayuh.conversation.length - 1]?.text || "").substring(0, 30) + "...";
        }
    }
    
    trigger.innerHTML = `<span class="ai-branch-icon awtsmoos-student-avatar">⑂</span> <span>Branch by @${commentData.author}: "${previewText}"</span>`;
    
    const content = document.createElement("div");
    content.className = "ai-branch-content awtsmoos-list-item";
    content.style.display = forceOpen ? "block" : "none";
    if(forceOpen) trigger.classList.add("active");

    const timelineContainer = document.createElement("div");
    timelineContainer.className = "ai-thread-timeline nested-timeline awtsmoos-comments-timeline";
    
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
