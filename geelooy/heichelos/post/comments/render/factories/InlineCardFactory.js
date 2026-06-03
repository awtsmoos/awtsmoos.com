// B"H
/**
 * @module InlineCardFactory
 * @description
 * Chapter 102: The inline card receives its golden dock.
 *
 * The Awtsmoos makes the insight almost as large as the verse, then crowns it
 * with avatar, coordinate, white Hebrew, and usable action buttons. No inline
 * style attributes are emitted; the violet-gold CSS owns every garment.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { getRealCommentSubSection, parseRealDayuh } from "../../logic/inlineManifest/realCommentCoordinate.js";
import { populateCommentElement } from "../corePopulation.js";
import { expandPathToComment } from "../tree.js";

function getAlias(comment) {
    return comment?.author || comment?.aliasId || comment?.owner || "commentator";
}

function getTitle(comment) {
    return comment?.dayuh?.title || comment?.content?.title || comment?.title || "Inline Commentary";
}

function coordinateLabel(comment) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    const verse = dayuh.verseSection ?? comment?.verseSection;
    const sub = getRealCommentSubSection(comment);
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`Verse ${Number(verse) + 1}`);
    if (sub !== null) parts.push(`Para ${Number(sub) + 1}`);
    return parts.length ? parts.join(", ") : "Verse insight";
}

function actionBlueprint(label, handler) {
    return {
        tag: "button",
        attr: { class: "awtsmoos-inline-action", type: "button", title: label },
        children: [label],
        events: { click: event => {
            event.preventDefault();
            event.stopPropagation();
            handler(event);
        } }
    };
}

function headerBlueprint(comment, alias) {
    return {
        tag: "header",
        attr: { class: "awtsmoos-inline-card-header" },
        children: [
            { tag: "div", attr: { class: "awtsmoos-inline-avatar" }, children: [String(alias).charAt(0).toUpperCase()] },
            { tag: "div", attr: { class: "awtsmoos-inline-card-heading" }, children: [
                { tag: "strong", attr: { class: "awtsmoos-inline-title" }, children: [`@${alias}`] },
                { tag: "span", attr: { class: "awtsmoos-inline-meta" }, children: [`${getTitle(comment)} · ${coordinateLabel(comment)}`] }
            ] }
        ]
    };
}

function actionDock(comment) {
    return {
        tag: "nav",
        attr: { class: "awtsmoos-inline-action-dock", "aria-label": "Inline comment actions" },
        children: [
            actionBlueprint("Locate", event => handleMarginalFocus(event, comment)),
            actionBlueprint("Reply", () => handleMarginalFocus({ stopPropagation() {}, preventDefault() {} }, comment)),
            actionBlueprint("Share", () => shareInlineComment(comment)),
            actionBlueprint("Copy", () => copyInlineComment(comment))
        ]
    };
}

export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");
    const alias = getAlias(comment);
    const manifest = BlueprintManifestor.manifest({
        tag: "article",
        attr: {
            class: "inline-comment intense-marginalia awtsmoos-inline-commentary-root awtsmoos-inline-card-v3 awtsmoos-readable-inline-card",
            "data-cid": comment.id,
            "data-alias": alias
        },
        children: [headerBlueprint(comment, alias), { tag: "div", attr: { class: "comment-body-vessel awtsmoos-inline-body" } }, actionDock(comment)]
    });
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

async function shareInlineComment(comment) {
    const url = `${location.origin}${location.pathname}${location.search}#comment-${encodeURIComponent(comment.id || "")}`;
    if (navigator.share) {
        try { await navigator.share({ title: "Awtsmoos inline insight", url }); return; } catch (_) {}
    }
    await navigator.clipboard?.writeText(url);
}

async function copyInlineComment(comment) {
    const text = typeof comment?.content === "string" ? comment.content : JSON.stringify(comment?.content || comment || {});
    await navigator.clipboard?.writeText(text);
}
