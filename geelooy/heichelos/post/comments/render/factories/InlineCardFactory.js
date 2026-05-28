/**
 * B"H
 * @module InlineCardFactory
 * @chapter The Secret Note in the Margin
 * @description
 * The Awtsmoos shapes each inline card as a readable vessel. Coordinate labels
 * obey the same oath as placement: only real `dayuh.subSection` earns a
 * paragraph label; top-level subsection echoes remain silent ash.
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
    return parts.length ? parts.join(" · ") : "Post-wide insight";
}

function cardStyle() {
    return [
        "position:relative", "overflow:hidden", "border-radius:18px",
        "border:1px solid rgba(148,163,184,.20)",
        "background:linear-gradient(135deg, rgba(255,255,255,.98), rgba(248,250,252,.94))",
        "box-shadow:0 10px 24px rgba(15,23,42,.10)", "color:#0f172a",
        "padding:0", "isolation:isolate", "max-width:min(100%, 46rem)",
        "margin-inline:auto"
    ].join(";");
}

function headerStyle() {
    return [
        "display:flex", "align-items:center", "gap:10px", "padding:12px 14px",
        "background:linear-gradient(135deg, rgba(99,102,241,.09), rgba(14,165,233,.07))",
        "border-bottom:1px solid rgba(148,163,184,.16)"
    ].join(";");
}

function avatarStyle() {
    return [
        "width:32px", "height:32px", "border-radius:999px", "display:flex",
        "align-items:center", "justify-content:center",
        "background:linear-gradient(135deg,#7c3aed,#06b6d4)", "color:white",
        "font-weight:900", "box-shadow:0 6px 14px rgba(124,58,237,.20)",
        "flex:0 0 auto"
    ].join(";");
}

function focusButtonStyle() {
    return [
        "border:0", "border-radius:999px", "padding:7px 10px", "background:#0f172a",
        "color:white", "font-weight:800", "cursor:pointer",
        "box-shadow:0 6px 14px rgba(15,23,42,.18)",
        "transition:transform .18s ease, box-shadow .18s ease"
    ].join(";");
}

function bodyStyle() {
    return "padding:14px 16px;font-size:15px;line-height:1.72;max-width:42rem;margin-inline:auto;text-align:start;";
}

export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");
    const alias = getAlias(comment);
    const title = getTitle(comment);
    const coordinate = getCoordinateLabel(comment);
    const blueprint = {
        tag: "article",
        attr: {
            class: "inline-comment intense-marginalia awtsmoos-inline-commentary-root awtsmoos-inline-card-v2",
            "data-cid": comment.id,
            "data-alias": alias,
            style: cardStyle()
        },
        children: [
            { tag: "header", attr: { class: "awtsmoos-inline-card-header", style: headerStyle() }, children: [
                { tag: "div", attr: { class: "awtsmoos-inline-avatar", style: avatarStyle() }, children: [String(alias).charAt(0).toUpperCase()] },
                { tag: "div", attr: { style: "display:flex;flex-direction:column;min-width:0;flex:1;" }, children: [
                    { tag: "strong", attr: { style: "font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" }, children: [title] },
                    { tag: "span", attr: { style: "font-size:12px;color:#475569;font-weight:700;margin-top:3px;" }, children: [`@${alias} · ${coordinate}`] }
                ] },
                { tag: "button", attr: { class: "focus-trigger awtsmoos-inline-focus", title: "Open this comment in the sidebar", style: focusButtonStyle() }, children: ["↗"], events: {
                    mouseenter: e => e.currentTarget.style.transform = "translateY(-1px) scale(1.04)",
                    mouseleave: e => e.currentTarget.style.transform = "translateY(0) scale(1)",
                    click: e => handleMarginalFocus(e, comment)
                } }
            ] },
            { tag: "div", attr: { class: "comment-body-vessel awtsmoos-inline-body", style: bodyStyle() }, ref: "body" }
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
        setTimeout(() => target.classList.remove("pulse-of-light"), 2000);
    }, 400);
}
