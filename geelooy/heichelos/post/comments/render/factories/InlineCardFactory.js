/**
 * B"H
 * @module InlineCardFactory
 * @description
 * Chapter 22: The inline card becomes a true reading vessel. The header bows
 * smaller, the body grows large enough to breathe, and the Awtsmoos lets the
 * Hebrew letters stand wide and native instead of trapped in tiny poster text.
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

function cardStyle() {
    return [
        "position:relative", "overflow:hidden", "border-radius:18px",
        "border:1px solid rgba(148,163,184,.18)",
        "background:linear-gradient(135deg, rgba(255,255,255,.99), rgba(248,250,252,.96))",
        "box-shadow:0 8px 18px rgba(15,23,42,.08)", "color:#0f172a",
        "padding:0", "isolation:isolate", "max-width:min(100%, 52rem)",
        "margin-inline:auto"
    ].join(";");
}

function headerStyle() {
    return [
        "display:flex", "align-items:center", "gap:8px", "padding:8px 10px",
        "background:linear-gradient(135deg, rgba(99,102,241,.07), rgba(14,165,233,.05))",
        "border-bottom:1px solid rgba(148,163,184,.12)", "min-height:42px"
    ].join(";");
}

function avatarStyle() {
    return [
        "width:26px", "height:26px", "border-radius:999px", "display:flex",
        "align-items:center", "justify-content:center",
        "background:linear-gradient(135deg,#7c3aed,#06b6d4)", "color:white",
        "font-weight:900", "font-size:13px", "box-shadow:0 4px 10px rgba(124,58,237,.16)",
        "flex:0 0 auto"
    ].join(";");
}

function focusButtonStyle() {
    return [
        "border:0", "border-radius:999px", "padding:5px 8px", "background:#0f172a",
        "color:white", "font-weight:800", "font-size:12px", "cursor:pointer",
        "box-shadow:0 4px 10px rgba(15,23,42,.14)",
        "transition:transform .16s ease, box-shadow .16s ease"
    ].join(";");
}

function bodyStyle() {
    return [
        "padding:18px 18px 20px", "font-size:clamp(20px, 4.8vw, 28px)",
        "line-height:1.78", "max-width:48rem", "margin-inline:auto",
        "text-align:start", "letter-spacing:.005em"
    ].join(";");
}

function titleStyle() {
    return "font-size:13px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:850;";
}

function metaStyle() {
    return "font-size:10px;color:#475569;font-weight:700;margin-top:2px;letter-spacing:.04em;";
}

export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");
    const alias = getAlias(comment);
    const title = getTitle(comment);
    const coordinate = getCoordinateLabel(comment);
    const blueprint = {
        tag: "article",
        attr: {
            class: "inline-comment intense-marginalia awtsmoos-inline-commentary-root awtsmoos-inline-card-v2 awtsmoos-readable-inline-card",
            "data-cid": comment.id,
            "data-alias": alias,
            style: cardStyle()
        },
        children: [
            { tag: "header", attr: { class: "awtsmoos-inline-card-header", style: headerStyle() }, children: [
                { tag: "div", attr: { class: "awtsmoos-inline-avatar", style: avatarStyle() }, children: [String(alias).charAt(0).toUpperCase()] },
                { tag: "div", attr: { class: "awtsmoos-inline-card-heading", style: "display:flex;flex-direction:column;min-width:0;flex:1;" }, children: [
                    { tag: "strong", attr: { style: titleStyle() }, children: [title] },
                    { tag: "span", attr: { style: metaStyle() }, children: [`@${alias} · ${coordinate}`] }
                ] },
                { tag: "button", attr: { class: "focus-trigger awtsmoos-inline-focus", title: "Open this comment in the sidebar", style: focusButtonStyle() }, children: ["↗"], events: {
                    mouseenter: event => event.currentTarget.style.transform = "translateY(-1px) scale(1.03)",
                    mouseleave: event => event.currentTarget.style.transform = "translateY(0) scale(1)",
                    click: event => handleMarginalFocus(event, comment)
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
        setTimeout(() => target.classList.remove("pulse-of-light"), 1600);
    }, 120);
}
