// B"H
/**
 * @module ProfileTreeCard
 * @description Chapter 73: The whole tree rests in one calm card.
 */

import { el, emptyCard } from "../dom.js";
import { treeNode } from "./treeNode.js";

export function treeCard(tree = []) {
    const card = el("section", { className: "profile-tree-card" }, [el("h2", { text: "Series Tree" })]);
    if (!tree.length) card.appendChild(emptyCard("No tree branches yet."));
    tree.forEach(root => card.appendChild(treeNode(root)));
    return card;
}
