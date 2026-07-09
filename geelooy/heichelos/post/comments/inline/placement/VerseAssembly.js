/**
 * B"H
 * @module VerseAssembly
 * @description
 * Chapter 416: The older inline assembly also learns the covenant. Summary
 * comments are not paragraphs and not trailing notes; when inline reading is
 * on, they receive the verse-summary anchor before section text.
 */
import { makeInlineCommentHolder, renderTreeItem, makeInlineComment } from "../../render.js";
import { ensureVerseSummaryAnchor, isSummarySubsection } from "../anchors/summaryAnchor.js";
function subKey(node) {
    const value = node?.comment?.dayuh?.subSection;
    if (isSummarySubsection(value)) return "summary";
    return value !== undefined && value !== null ? value : "main";
}
function categoryMap(tree) {
    return tree.reduce((acc, node) => {
        const key = subKey(node);
        if (!acc[key]) acc[key] = [];
        acc[key].push(node);
        return acc;
    }, {});
}
export function processVersePlacement(tree, alias, verseKey) {
    const selector = `.section[data-awtsmoos-idx='${verseKey}'], .section[data-idx='${verseKey}']`;
    const sectionElement = document.querySelector(selector);
    if (!sectionElement) return;
    const grouped = categoryMap(tree);
    if (grouped.summary) paintCategoryGroup(grouped.summary, alias, verseKey, "summary", sectionElement);
    for (const key in grouped) if (key !== "summary") paintCategoryGroup(grouped[key], alias, verseKey, key, sectionElement);
}
function hostFor(section, sKey) {
    if (sKey === "summary") return { host: ensureVerseSummaryAnchor(section) || section, typeIsPara: false, beforeContent: true };
    if (sKey !== "main") {
        const subFinder = `.sub-awtsmoos[data-awtsmoos-sub='${sKey}'], .sub-awtsmoos[data-idx='${sKey}']`;
        const subVessel = section.querySelector(subFinder);
        if (subVessel) return { host: subVessel, typeIsPara: true, beforeContent: false };
    }
    return { host: section, typeIsPara: false, beforeContent: false };
}
function mountGateway(host, author, vKey, sKey, typeIsPara, beforeContent) {
    let gateway = host.querySelector(`.commentator.inline[data-alias='${author}']`);
    if (gateway) return gateway;
    gateway = makeInlineCommentHolder(author, host, vKey);
    gateway.dataset.inlinePlacementKind = sKey === "summary" ? "summary" : "comment";
    if (beforeContent) host.appendChild(gateway);
    else {
        const refMarker = host.querySelector(typeIsPara ? ".awtsmoos-comment-indicator" : ".toichen");
        if (refMarker) refMarker.after(gateway);
        else host.appendChild(gateway);
    }
    return gateway;
}
function paintCategoryGroup(branchTree, author, vKey, sKey, section) {
    const { host, typeIsPara, beforeContent } = hostFor(section, sKey);
    if (!host) return;
    const gateway = mountGateway(host, author, vKey, sKey, typeIsPara, beforeContent);
    const marginRoom = gateway.querySelector(".comments-holder-inline");
    if (!marginRoom) return;
    marginRoom.innerHTML = "";
    branchTree.forEach(sparkNode => renderTreeItem(sparkNode, marginRoom, c => makeInlineComment(c), "inline"));
}
