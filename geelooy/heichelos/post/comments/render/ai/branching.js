//B"H
import { renderNestedThread } from "./thread.js";

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
        processPendingForks(); // Recurse to handle grandchildren
    }
}
