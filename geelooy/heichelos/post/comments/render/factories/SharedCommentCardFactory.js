// B"H
/**
 * @module SharedCommentCardFactory
 * @description
 * Chapter 175: The profile button dissolves into the author's crown.
 * Sidebar and inline cards share one renderer. The alias itself is now the
 * profile portal, while a user-written comment title receives its own luminous
 * title band above the body. System labels remain small; the user's title sings.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { handleMenuOption } from "../actions.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { expandPathToComment } from "../tree.js";
import { getRealCommentSubSection, parseRealDayuh } from "../../logic/inlineManifest/realCommentCoordinate.js";

function aliasOf(comment) { return comment?.author || comment?.aliasId || comment?.owner || "unknown"; }
function rawTitleOf(comment) { return comment?.dayuh?.title || comment?.content?.title || comment?.title || ""; }
function cleanTitleOf(comment) {
    const title = String(rawTitleOf(comment) || "").trim();
    return title && title.toLowerCase() !== "insight" ? title : "";
}

function coordOf(comment) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    const verse = dayuh.verseSection ?? comment?.verseSection;
    const sub = getRealCommentSubSection(comment);
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`Verse ${Number(verse) + 1}`);
    if (sub !== null) parts.push(`Para ${Number(sub) + 1}`);
    return parts.join(", ") || "Post insight";
}

async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
        const area = document.createElement("textarea");
        area.value = text;
        area.className = "awtsmoos-clipboard-proxy";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }
}

function textForCopy(comment) {
    const value = comment?.content?.text || comment?.content?.plain || comment?.content?.body || comment?.content || comment?.text || comment?.body || "";
    return typeof value === "string" ? value : JSON.stringify(value || comment || {});
}

function locateComment(comment) {
    const cid = CSS.escape(String(comment?.id || ""));
    const target = document.querySelector(`.inline-comment[data-cid="${cid}"]`) || document.querySelector(`.awtsmoos-sidebar-comment-card[data-cid="${cid}"]`);
    if (!target) return;
    expandPathToComment(target);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("signal-active", "pulse-of-light");
    setTimeout(() => target.classList.remove("signal-active", "pulse-of-light"), 1600);
}

async function shareComment(comment) {
    const link = `${location.origin}${location.pathname}${location.search}#comment-${encodeURIComponent(comment?.id || "")}`;
    if (navigator.share) {
        try { await navigator.share({ title: "Awtsmoos insight", url: link }); return; } catch (_) {}
    }
    await copyText(link);
}

function makeButton(label, className, onClick) {
    return { tag: "button", attr: { class: className, type: "button", title: label }, children: [label], events: { click: async event => {
        event.preventDefault();
        event.stopPropagation();
        await onClick(event);
    } } };
}

function actionDock(comment, mode) {
    const chip = mode === "inline" ? "awtsmoos-inline-action" : "comment-chip-action";
    const specific = mode === "inline" ? "awtsmoos-inline-action-dock inline-comment-actions" : "sidebar-comment-actions";
    return { tag: "nav", attr: { class: `awtsmoos-comment-action-dock ${specific}`, "aria-label": "Comment actions" }, children: [
        makeButton("Reply", chip, event => handleMenuOption("Reply", comment, event.target)),
        makeButton("Locate", chip, () => locateComment(comment)),
        makeButton("Copy", chip, () => copyText(textForCopy(comment))),
        makeButton("Share", chip, () => shareComment(comment))
    ] };
}

function moreMenu(comment) {
    return { tag: "details", attr: { class: "menu-chariot awtsmoos-comment-more" }, children: [
        { tag: "summary", attr: { class: "menu-btn comment-chip-action" }, children: ["More"] },
        { tag: "div", attr: { class: "menu-dropdown" }, children: ["Reply", "Copy", "Delete"].map(option => ({ tag: "button", attr: { class: "menu-item", type: "button" }, children: [option], events: { click: event => { event.stopPropagation(); handleMenuOption(option, comment, event.target); } } })) }
    ] };
}

function authorPortal(alias) {
    return { tag: "a", attr: { class: "comment-author-link awtsmoos-author-crown", href: `/@${encodeURIComponent(alias)}`, target: "_blank", title: `Open @${alias}` }, children: [`@${alias}`] };
}

function header(comment) {
    const alias = aliasOf(comment);
    return { tag: "header", attr: { class: "awtsmoos-comment-card-header" }, children: [
        { tag: "div", attr: { class: "awtsmoos-comment-avatar" }, children: [String(alias).charAt(0).toUpperCase()] },
        { tag: "div", attr: { class: "awtsmoos-comment-heading" }, children: [authorPortal(alias), { tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [coordOf(comment)] }] }
    ] };
}

function titleBand(comment) {
    const title = cleanTitleOf(comment);
    if (!title) return null;
    return { tag: "div", attr: { class: "awtsmoos-comment-title-band", dir: "auto" }, children: [title] };
}

export function makeSharedCommentCard(comment, { mode = "sidebar" } = {}) {
    if (!comment) return document.createComment("No comment");
    const alias = aliasOf(comment);
    const modeClass = mode === "inline" ? "inline-comment awtsmoos-inline-commentary-root awtsmoos-inline-card-v3 awtsmoos-readable-inline-card" : "awtsmoos-sidebar-comment-card";
    const classes = ["comment-content", "awtsmoos-card", "awtsmoos-shared-comment-card", modeClass, isAliasInline(alias) ? "is-inline-enabled" : ""].filter(Boolean).join(" ");
    const card = BlueprintManifestor.manifest({ tag: "article", attr: { class: classes, "data-cid": comment.id, "data-alias": alias, "data-from-alias": alias, id: `comment-${comment.id}` }, children: [header(comment), titleBand(comment), { tag: "div", attr: { class: "comment-text-root awtsmoos-comment-body" } }, actionDock(comment, mode), mode === "sidebar" ? moreMenu(comment) : null] });
    populateCommentElement(comment, card.querySelector(".comment-text-root"));
    return card;
}
