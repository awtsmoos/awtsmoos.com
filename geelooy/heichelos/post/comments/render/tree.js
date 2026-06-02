// /BH/awtsmoos.com/geelooy/heichelos/post/comments/render/tree.js
//B"H
/**
 * @file tree.js
 * The logic of branching and expansion.
 */

export function expandPathToComment(element) {
    if (!element) return;
    const parentSlot = element.closest('.children-slot');
    if (parentSlot) {
        parentSlot.classList.remove('hidden');
        parentSlot.style.display = "flex";
        const wrapper = parentSlot.closest('.comment-wrapper');
        if (wrapper) {
            const toggleBtn = wrapper.querySelector('.reply-toggle-btn');
            if (toggleBtn) {
                toggleBtn.dataset.expanded = "true";
                toggleBtn.innerHTML = "▼ Hide Replies";
            }
        }
        expandPathToComment(parentSlot.parentElement);
    }
    const mainHolder = element.closest('.inline-scroll-container'); 
    if (mainHolder && getComputedStyle(mainHolder).display === "none") {
        mainHolder.style.display = "block";
        const wrapper = mainHolder.closest('.commentator');
        const btn = wrapper?.querySelector('.inline-summary-btn');
        if(btn) btn.classList.add('active');
    }
}

export function renderTreeItem(node, container, factoryMethod, type, expandedReplies = new Set()) {
    const { comment, children } = node;
    const wrapper = document.createElement("div");
    wrapper.className = "comment-wrapper awtsmoos-list-item";
    
    const card = factoryMethod(comment);
    wrapper.appendChild(card);
    
    if (children && children.length > 0) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "reply-toggle-btn";
        
        const childSlot = document.createElement("div");

        const updateViewState = (isExpanded) => {
            if (isExpanded) {
                childSlot.classList.remove("hidden");
                childSlot.style.display = "flex";
                toggleBtn.innerHTML = "▼ Hide Replies";
                toggleBtn.dataset.expanded = "true";
            } else {
                childSlot.classList.add("hidden");
                childSlot.style.setProperty('display', 'none', 'important');
                toggleBtn.innerHTML = `▶ View ${children.length} Repl${children.length > 1 ? 'ies' : 'y'}`;
                toggleBtn.dataset.expanded = "false";
            }
        };
        
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            const isCurrentlyExpanded = toggleBtn.dataset.expanded === "true";
            updateViewState(!isCurrentlyExpanded);
            
            if (!isCurrentlyExpanded) {
                setTimeout(() => {
                    childSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
            }
        };
        
        wrapper.appendChild(toggleBtn);
        
        // B"H - Apply persisted state on initial render
        updateViewState(expandedReplies.has(comment.id));
        
        children.forEach(childNode => renderTreeItem(childNode, childSlot, factoryMethod, type, expandedReplies));
        
        wrapper.appendChild(childSlot);
    }
    
    container.appendChild(wrapper);
}
