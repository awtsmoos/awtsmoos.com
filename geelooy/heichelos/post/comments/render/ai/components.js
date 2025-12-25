
//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";

/**
 * Creates the visual message block.
 * @param {Object} msg - { role: 'user'|'model', text: '...', name: 'optionalAlias' }
 * @param {number} index - Index in the thread history
 * @param {Object} options - { onFork, onCollapse, onCollapseBelow, isOwner, canInteract }
 */
export function createMessageNode(msg, index, options = {}) {
    const { onFork, isOwner, canInteract } = options;
    
    const block = document.createElement("div");
    block.className = `ai-thread-block ${msg.role === 'model' ? 'model' : 'user'}`;
    block.dataset.msgIndex = index;

    // --- Bubble Content ---
    const content = document.createElement("div");
    content.className = "ai-block-content";
    
    // Header
    const metaHeader = document.createElement("div");
    metaHeader.className = "ai-msg-meta";
    
    const roleSpan = document.createElement("span");
    if(msg.role === 'model') {
        roleSpan.innerHTML = "✨ AI";
    } else {
        // Display specific alias if available, otherwise generic
        roleSpan.innerHTML = msg.name ? `@${msg.name}` : "USER";
        roleSpan.style.fontWeight = "bold";
    }
    
    // Mini Toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "ai-toolbar-mini";
    
    const minBtn = document.createElement("button");
    minBtn.className = "ai-btn-mini";
    minBtn.innerText = "_";
    minBtn.title = "Minimize Message Content";
    minBtn.onclick = (e) => {
        e.stopPropagation();
        block.classList.toggle("collapsed");
        minBtn.innerText = block.classList.contains("collapsed") ? "+" : "_";
    };

    const collapseBelowBtn = document.createElement("button");
    collapseBelowBtn.className = "ai-btn-mini";
    collapseBelowBtn.innerText = "▼";
    collapseBelowBtn.title = "Hide messages below";
    
    collapseBelowBtn.onclick = (e) => {
        e.stopPropagation();
        const isHidden = !block.classList.contains("siblings-hidden");
        block.classList.toggle("siblings-hidden", isHidden);
        
        let next = block.nextElementSibling;
        while(next) {
            if(next.nodeType === 1) { // Element node
                if(isHidden) {
                    next.dataset.originalDisplay = next.style.display;
                    next.style.display = 'none';
                } else {
                     next.style.display = next.dataset.originalDisplay || '';
                }
            }
            next = next.nextElementSibling;
        }

        if(isHidden) {
            collapseBelowBtn.innerText = "▲";
            collapseBelowBtn.title = "Show messages below";
        } else {
            collapseBelowBtn.innerText = "▼";
            collapseBelowBtn.title = "Hide messages below";
        }
    };

    toolbar.appendChild(minBtn);
    toolbar.appendChild(collapseBelowBtn);
    
    metaHeader.appendChild(roleSpan);
    metaHeader.appendChild(toolbar);
    content.appendChild(metaHeader);
    
    // Text Body
    const textDiv = document.createElement("div");
    textDiv.className = "ai-content-text";
    textDiv.innerHTML = msg.role === "user" 
        ? msg.text.replace(/\n/g, "<br>") 
        : markdownToHtml(msg.text);
    content.appendChild(textDiv);
    
    // Actions (Reply/Fork)
    // Allow if user is logged in (canInteract)
    if (canInteract) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "ai-msg-actions";
        
        const forkBtn = document.createElement("button");
        forkBtn.className = "ai-action-btn";
        forkBtn.innerHTML = "⑂ Reply / Branch"; 
        forkBtn.title = "Reply to this message (Creates a branch)";
        forkBtn.onclick = (e) => {
            e.stopPropagation();
            const slot = block.querySelector(".ai-forks-slot");
            if(onFork && slot) onFork(slot);
        };
        actionsDiv.appendChild(forkBtn);
        content.appendChild(actionsDiv);
    }

    block.appendChild(content);

    // --- Fork Slot ---
    const forksSlot = document.createElement("div");
    forksSlot.className = "ai-forks-slot";
    block.appendChild(forksSlot);

    return block;
}

export function createThreadContainer(className = "ai-thread-timeline") {
    const div = document.createElement("div");
    div.className = className;
    return div;
}
