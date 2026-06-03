// B"H
/**
 * @module InlineCardFactory
 * @description
 * Chapter 76: The inline insight becomes a page-like card.
 *
 * No inline white-card styles remain. The factory emits semantic classes and
 * lets the reborn CSS decide size, rhythm, darkness, and mobile breath. The
 * Hebrew body is large enough to read, and the card stacks vertically with no
 * horizontal flex procession.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { getRealCommentSubSection, parseRealDayuh } from "../../logic/inlineManifest/realCommentCoordinate.js";
import { populateCommentElement } from "../corePopulation.js";
import { expandPathToComment } from "../tree.js";

function getAlias(comment) {
    return comment?.author || comment?.aliasId || comment?.owner || "commentator";
}

function getTitle(comment) {
    return comment?.dayuh?.title || comment?.content?.title || comment?.title || "Inline insight";
}

function getCoordinateLabel(comment) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    const verse = dayuh.verseSection ?? comment?.verseSection;
    const sub = getRealCommentSubSection(comment);
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`Verse ${Number(verse) + 1}`);
    if (sub !== null) parts.push(`Paragraph ${Number(sub) + 1}`);
    return parts.length ? parts.join(" · ") : "Verse insight";
}

function headerBlueprint(comment, alias) {
    return {
        tag: "header",
        attr: { class: "awtsmoos-inline-card-header" },
        children: [
            { tag: "button", attr: { class: "awtsmoos-inline-focus", type: "button", title: "Open this comment in the sidebar" }, children: ["↗"], events: { click: event => handleMarginalFocus(event, comment) } },
            { tag: "div", attr: { class: "awtsmoos-inline-card-heading" }, children: [
                { tag: "strong", attr: { class: "awtsmoos-inline-title" }, children: [getTitle(comment)] },
                { tag: "span", attr: { class: "awtsmoos-inline-meta" }, children: [`@${alias} · ${getCoordinateLabel(comment)}`] }
            ] },
            { tag: "div", attr: { class: "awtsmoos-inline-avatar" }, children: [String(alias).charAt(0).toUpperCase()] }
        ]
    };
}

export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");
    const alias = getAlias(comment);
    const blueprint = {
        tag: "article",
        attr: {
            class: "inline-comment intense-marginalia awtsmoos-inline-commentary-root awtsmoos-inline-card-v3 awtsmoos-readable-inline-card",
            "data-cid": comment.id,
            "data-alias": alias
        },
        children: [
            headerBlueprint(comment, alias),
            { tag: "div", attr: { class: "comment-body-vessel awtsmoos-inline-body" } }
        ]
    };
    const manifest = BlueprintManifestor.manifest(blueprint);
    populateCommentElement(comment, manifest.querySelector(".comment-body-vessel"));
    return manifest;
}

async function handleMarginalFocus(event, comment) {
    event.stopPropagation();
    if (!window.openCommentsPanelToAlias) return;
    const container = await window.openCommentsPanelToAlias(getAlias(comment));
    if (!container) return;
    setTimeout(() => {
        const safeId = String(comment.id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const target = container.querySelector(`.comment-content[data-cid="${safeId}"]`);
        if (!target) return;
        expandPathToComment(target);
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("pulse-of-light");
        setTimeout(() => target.classList.remove("pulse-of-light"), 1600);
    }, 120);
}
