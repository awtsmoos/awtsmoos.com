// B"H
/**
 * @module ProfileTreeNode
 * @description Chapter 72: The tree opens in quiet folds: Heichel, series,
 * child series, and post counts.
 */

import { el, clean } from "../dom.js";

export function treeNode(item, depth = 0) {
    const details = el("details", { className: "profile-tree-node" });
    details.open = depth < 1;
    details.appendChild(el("summary", { className: "profile-tree-summary", html: `<span>${clean(item.heichelName || item.title)}</span><small>${item.postsCount || 0} posts</small>` }));
    const children = item.children || [];
    children.forEach(child => details.appendChild(treeNode(child, depth + 1)));
    if (!children.length) details.appendChild(el("p", { className: "profile-tree-empty", text: "No child branches." }));
    return details;
}
