// B"H
/**
 * @module SharedCommentCardFactory
 * @description
 * Chapter 215: The visual card delegates actions to the single action gate.
 * Copy/Edit/Reply/Share/Delete all pass through comments/actions/menu.js, so
 * object-shaped comments and legacy strings behave the same in sidebar and inline.
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

function locateComment(comment) {
    const cid = CSS.escape(String(comment?.id || ""));
    const target = document.querySelector(`.inline-comment[data-cid="${cid}"]`) || document.querySelector(`.awtsmoos-sidebar-comment-card[data-cid="${cid}"]`);
    if (!target) return;
    expandPathToComment(target);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("signal-active", "pulse-of-light");
    setTimeout(() => target.classList.remove("signal-active", "pulse-of-light"), 1600);
}

function menuAction(option, comment, event) {
    event.preventDefault();
    event.stopPropagation();
    const menu = event.currentTarget.closest("details");
    if (menu) menu.open = false;
    if (option === "Locate") return locateComment(comment);
    return handleMenuOption(option, comment, event.currentTarget);
}

function makeButton(label, className, onClick) {
    return { tag: "button", attr: { class: className, type: "button", title: label }, children: [label], events: { click: async event => {
        event.preventDefault();
        event.stopPropagation();
        await onClick(event);
    } } };
}

function sidebarActionDock(comment) {
    return { tag: "nav", attr: { class: "awtsmoos-comment-action-dock sidebar-comment-actions", "aria-label": "Comment actions" }, children: [
        makeButton("Reply", "comment-chip-action", event => handleMenuOption("Reply", comment, event.target)),
        makeButton("Copy", "comment-chip-action", event => handleMenuOption("Copy", comment, event.target)),
        makeButton("Share", "comment-chip-action", event => handleMenuOption("Share", comment, event.target))
    ] };
}

function moreOptions(mode) {
    if (mode === "inline") return ["Reply", "Copy", "Share", "Edit"];
    return ["Reply", "Copy", "Share", "Edit", "Locate", "Delete"];
}

function moreMenu(comment, mode) {
    return { tag: "details", attr: { class: `menu-chariot awtsmoos-comment-more awtsmoos-${mode}-comment-menu` }, children: [
        { tag: "summary", attr: { class: "menu-btn comment-chip-action", "aria-label": "Comment actions" }, children: [mode === "inline" ? "⋯" : "More"] },
        { tag: "div", attr: { class: "menu-dropdown" }, children: moreOptions(mode).map(option => ({
            tag: "button",
            attr: { class: "menu-item", type: "button" },
            children: [option],
            events: { click: event => menuAction(option, comment, event) }
        })) }
    ] };
}

function authorPortal(alias) {
    return { tag: "a", attr: { class: "comment-author-link awtsmoos-author-crown", href: `/@${encodeURIComponent(alias)}`, target: "_blank", title: `Open @${alias}` }, children: [`@${alias}`] };
}

function header(comment, mode) {
    const alias = aliasOf(comment);
    return { tag: "header", attr: { class: "awtsmoos-comment-card-header" }, children: [
        { tag: "div", attr: { class: "awtsmoos-comment-avatar" }, children: [String(alias).charAt(0).toUpperCase()] },
        { tag: "div", attr: { class: "awtsmoos-comment-heading" }, children: [authorPortal(alias), { tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [coordOf(comment)] }] },
        mode === "inline" ? moreMenu(comment, mode) : null
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
    const card = BlueprintManifestor.manifest({
        tag: "article",
        attr: { class: classes, "data-cid": comment.id, "data-alias": alias, "data-from-alias": alias, id: `comment-${comment.id}` },
        children: [header(comment, mode), titleBand(comment), { tag: "div", attr: { class: "comment-text-root awtsmoos-comment-body" } }, mode === "sidebar" ? sidebarActionDock(comment) : null, mode === "sidebar" ? moreMenu(comment, mode) : null]
    });
    populateCommentElement(comment, card.querySelector(".comment-text-root"));
    return card;
}
