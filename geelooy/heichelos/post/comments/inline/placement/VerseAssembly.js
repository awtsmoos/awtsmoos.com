
/**
 * B"H
 * @module VerseAssembly
 * @chapter Positioning sparks in the Body of the Verse
 */

import { makeInlineCommentHolder, renderTreeItem, makeInlineComment } from "../../render.js";

/**
 * @function processVersePlacement
 * @description Locates the physical vessels and weaves the tree.
 */
export function processVersePlacement(tree, alias, verseKey) {
    const selector = `.section[data-awtsmoos-idx='${verseKey}'], .section[data-idx='${verseKey}']`;
    const sectionElement = document.querySelector(selector);
    if (!sectionElement) return;

    // Distinguish between paragraphs (sub-sections) and global verse body
    const subCategories = tree.reduce((acc, node) => {
        const subId = (node.comment.dayuh?.subSection !== undefined && node.comment.dayuh?.subSection !== null) ? node.comment.dayuh.subSection : 'main';
        if (!acc[subId]) acc[subId] = [];
        acc[subId].push(node);
        return acc;
    }, {});

    for (const key in subCategories) {
        paintCategoryGroup(subCategories[key], alias, verseKey, key, sectionElement);
    }
}

/**
 * @private
 * @function paintCategoryGroup
 */
function paintCategoryGroup(branchTree, author, vKey, sKey, section) {
    let host = section;
    let typeIsPara = false;

    if (sKey !== 'main') {
        const subFinder = `.sub-awtsmoos[data-awtsmoos-sub='${sKey}'], .sub-awtsmoos[data-idx='${sKey}']`;
        const subVessel = section.querySelector(subFinder);
        if (subVessel) { host = subVessel; typeIsPara = true; }
    }

    let gateway = host.querySelector(`.commentator.inline[data-alias='${author}']`);
    if (!gateway) {
        gateway = makeInlineCommentHolder(author, host, vKey);
        const refMarker = host.querySelector(typeIsPara ? '.awtsmoos-comment-indicator' : '.toichen');
        if (refMarker) refMarker.after(gateway); else host.appendChild(gateway);
    }

    const marginRoom = gateway.querySelector('.comments-holder-inline');
    marginRoom.innerHTML = "";
    branchTree.forEach(sparkNode => renderTreeItem(sparkNode, marginRoom, (c) => makeInlineComment(c), 'inline'));
}
