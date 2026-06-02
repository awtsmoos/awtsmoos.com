//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { toggleBranchInput } from "/heichelos/post/comments/render/ai/input.js";

/**
 * B"H - Creates a clean message node.
 */
export function createMessageNode(msg, index, fullHistory, commentData, commentId) {
    const block = document.createElement("div");
    block.className = `ai-thread-block ${msg.role === 'model' ? 'model' : 'user'}`;
    block.dataset.msgIndex = index;
    block.id = `msg-${commentId}-${index}`;

    // Bubble Content
    const content = document.createElement("div");
    content.className = "ai-block-content";
    
    // Meta Header inside bubble
    const metaHeader = document.createElement("div");
    metaHeader.className = "ai-msg-meta";
    
    const roleSpan = document.createElement("span");
    roleSpan.className = "ai-role-label ai-role-tag";
    roleSpan.innerText = msg.role === 'user' ? 'USER' : 'AI';
    metaHeader.appendChild(roleSpan);
    
    content.appendChild(metaHeader);
    
    // Text Content
    const textDiv = document.createElement("div");
    textDiv.className = "ai-content-text";
    textDiv.innerHTML = msg.role === "user" 
        ? msg.text.replace(/\n/g, "<br>") 
        : markdownToHtml(msg.text);
    content.appendChild(textDiv);
    
    // Actions (Fork button)
    if (window.curAlias) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "ai-msg-actions awtsmoos-sidebar-actions";
        
        const replyBtn = document.createElement("button");
        replyBtn.className = "ai-action-btn btn awtsmoos-hero-btn";
        replyBtn.innerHTML = "[FORK REALITY]";
        replyBtn.title = "Create a new branch from here";
        replyBtn.onclick = (e) => {
            e.stopPropagation();
            const branchContainer = block.querySelector(".ai-branch-container");
            toggleBranchInput(branchContainer, index, fullHistory, commentData.author, commentData, commentId);
        };
        actionsDiv.appendChild(replyBtn);
        content.appendChild(actionsDiv);
    }

    block.appendChild(content);

    // Branch Container (Nested below bubble)
    const branchContainer = document.createElement("div");
    branchContainer.className = "ai-branch-container awtsmoos-card";
    block.appendChild(branchContainer);

    return block;
}
