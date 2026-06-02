//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";

/**
 * Creates the visual message block.
 * @param {Object} msg - { role: 'user'|'model', text: '...', name: 'optionalAlias' }
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
    roleSpan.className = "ai-role-tag";
    if(msg.role === 'model') {
        roleSpan.innerHTML = "✨ AI";
    } else {
        roleSpan.innerHTML = msg.name ? `@${msg.name}` : "USER";
    }
    
    // Mini Toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "ai-toolbar-mini awtsmoos-sidebar-actions";
    
    const minBtn = document.createElement("button");
    minBtn.className = "ai-btn-mini btn";
    minBtn.innerText = "_";
    minBtn.onclick = (e) => {
        e.stopPropagation();
        const isCollapsed = !block.classList.contains("collapsed");
        block.classList.toggle("collapsed", isCollapsed);
        minBtn.innerText = isCollapsed ? "..." : "_";
    };

    const collapseBelowBtn = document.createElement("button");
    collapseBelowBtn.className = "ai-btn-mini btn";
    collapseBelowBtn.innerText = "▼";
    
    collapseBelowBtn.onclick = (e) => {
        e.stopPropagation();
        const isHidden = !block.classList.contains("siblings-hidden");
        block.classList.toggle("siblings-hidden", isHidden);
        
        let next = block.nextElementSibling;
        while(next) {
            if(next.nodeType === 1) { 
                next.style.display = isHidden ? 'none' : '';
            }
            next = next.nextElementSibling;
        }

        collapseBelowBtn.innerText = isHidden ? "..." : "▼";
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
    
    if (canInteract) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "ai-msg-actions awtsmoos-sidebar-actions";
        const forkBtn = document.createElement("button");
        forkBtn.className = "ai-action-btn btn awtsmoos-hero-btn";
        forkBtn.innerHTML = "Branch"; 
        forkBtn.onclick = (e) => {
            e.stopPropagation();
            const slot = block.querySelector(".ai-forks-slot");
            if(onFork && slot) onFork(slot);
        };
        actionsDiv.appendChild(forkBtn);
        content.appendChild(actionsDiv);
    }

    block.appendChild(content);

    const forksSlot = document.createElement("div");
    forksSlot.className = "ai-forks-slot awtsmoos-list-item";
    block.appendChild(forksSlot);

    return block;
}

export function createThreadContainer(className = "ai-thread-timeline") {
    const div = document.createElement("div");
    div.className = className;
    return div;
}