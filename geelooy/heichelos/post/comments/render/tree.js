// B"H
/**
 * @module CommentTreeRendering
 * @description
 * Chapter 117: Replies open without forcing flex-worlds.
 * The Awtsmoos lets CSS own layout. Expansion only toggles attributes/classes,
 * never inline display rules that can resurrect horizontal chaos.
 */

export function expandPathToComment(element) {
    if (!element) return;
    const parentSlot = element.closest(".children-slot");
    if (parentSlot) {
        parentSlot.hidden = false;
        parentSlot.classList.remove("hidden");
        const wrapper = parentSlot.closest(".comment-wrapper");
        const toggleBtn = wrapper?.querySelector(".reply-toggle-btn");
        if (toggleBtn) {
            toggleBtn.dataset.expanded = "true";
            toggleBtn.textContent = "Hide Replies";
        }
        expandPathToComment(parentSlot.parentElement);
    }
    const holder = element.closest(".comments-holder-inline, .awtsmoos-inline-comments");
    if (holder?.hidden) {
        holder.hidden = false;
        const shell = holder.closest(".commentator");
        const btn = shell?.querySelector(".inline-summary-btn");
        if (btn) {
            btn.classList.add("active");
            btn.setAttribute("aria-expanded", "true");
        }
    }
}

function updateReplyState(slot, button, count, isExpanded) {
    slot.hidden = !isExpanded;
    slot.classList.toggle("hidden", !isExpanded);
    button.dataset.expanded = String(isExpanded);
    button.textContent = isExpanded ? "Hide Replies" : `View ${count} Repl${count > 1 ? "ies" : "y"}`;
}

export function renderTreeItem(node, container, factoryMethod, type, expandedReplies = new Set()) {
    const { comment, children } = node;
    const wrapper = document.createElement("div");
    wrapper.className = `comment-wrapper awtsmoos-list-item ${type === "inline" ? "inline-comment-wrapper" : "sidebar-comment-wrapper"}`;
    wrapper.appendChild(factoryMethod(comment));
    if (children?.length) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "reply-toggle-btn";
        const childSlot = document.createElement("div");
        childSlot.className = "children-slot";
        const open = expandedReplies.has(comment.id);
        updateReplyState(childSlot, toggleBtn, children.length, open);
        toggleBtn.onclick = event => {
            event.stopPropagation();
            const next = toggleBtn.dataset.expanded !== "true";
            updateReplyState(childSlot, toggleBtn, children.length, next);
            if (next) setTimeout(() => childSlot.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
        };
        children.forEach(childNode => renderTreeItem(childNode, childSlot, factoryMethod, type, expandedReplies));
        wrapper.append(toggleBtn, childSlot);
    }
    container.appendChild(wrapper);
}
