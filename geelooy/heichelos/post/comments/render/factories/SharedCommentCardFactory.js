// B"H
/**
 * @module SharedCommentCardFactory
 * @description
 * Chapter 415: Inline cards receive their true name. A Meluket summary is no
 * longer presented as Para NaN or hidden at verse-end; it wears a summary crown
 * and sits in the before-section anchor.
 */
import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { handleMenuOption } from "../actions.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { expandPathToComment } from "../tree.js";
import { getCommentPlacementKind, getRealCommentSubSection, parseRealDayuh } from "../../logic/inlineManifest/realCommentCoordinate.js";
const NOISY_TITLES = /^(insight|inline insight\s*\d*|inline commentary|commentary)$/i;
function aliasOf(comment) { return comment?.author || comment?.aliasId || comment?.owner || "unknown"; }
function rawTitleOf(comment) { return comment?.dayuh?.title || comment?.content?.title || comment?.title || ""; }
function cleanTitleOf(comment) { const title = String(rawTitleOf(comment) || "").trim(); return title && !NOISY_TITLES.test(title) ? title : ""; }
function numberLabel(value, offset = 1) { const n = Number(value); return Number.isFinite(n) ? String(n + offset) : String(value); }
function coordOf(comment) {
    const dayuh = parseRealDayuh(comment?.dayuh);
    const verse = dayuh.verseSection ?? comment?.verseSection;
    const sub = getRealCommentSubSection(comment);
    if (getCommentPlacementKind(comment) === "summary") return verse !== undefined && verse !== null && verse !== "root" ? `Summary before Verse ${numberLabel(verse)}` : "Section summary";
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`Verse ${numberLabel(verse)}`);
    if (sub !== null) parts.push(`Para ${numberLabel(sub)}`);
    return parts.join(", ") || "Post";
}
function locateComment(comment) {
    const cid = CSS.escape(String(comment?.id || ""));
    const target = document.querySelector(`.inline-comment[data-cid="${cid}"], .awtsmoos-sidebar-comment-card[data-cid="${cid}"]`);
    if (!target) return;
    expandPathToComment(target);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("signal-active", "pulse-of-light");
    setTimeout(() => target.classList.remove("signal-active", "pulse-of-light"), 1600);
}
function menuAction(option, comment, event) {
    event.preventDefault(); event.stopPropagation();
    const menu = event.currentTarget.closest("details");
    if (menu) menu.open = false;
    return option === "Locate" ? locateComment(comment) : handleMenuOption(option, comment, event.currentTarget);
}
function makeButton(label, className, onClick) {
    return { tag: "button", attr: { class: className, type: "button", title: label }, children: [label], events: { click: async event => { event.preventDefault(); event.stopPropagation(); await onClick(event); } } };
}
function sidebarActionDock(comment) {
    return { tag: "nav", attr: { class: "awtsmoos-comment-action-dock sidebar-comment-actions", "aria-label": "Comment actions" }, children: [
        makeButton("Reply", "comment-chip-action", event => handleMenuOption("Reply", comment, event.target)),
        makeButton("Copy", "comment-chip-action", event => handleMenuOption("Copy", comment, event.target)),
        makeButton("Share", "comment-chip-action", event => handleMenuOption("Share", comment, event.target))
    ] };
}
function moreOptions(mode) { return mode === "inline" ? ["Reply", "Copy", "Share", "Edit"] : ["Edit", "Locate", "Delete"]; }
function moreMenu(comment, mode) {
    return { tag: "details", attr: { class: `menu-chariot awtsmoos-comment-more awtsmoos-${mode}-comment-menu` }, children: [
        { tag: "summary", attr: { class: "menu-btn comment-chip-action", "aria-label": "More comment actions" }, children: [mode === "inline" ? "⋯" : "More"] },
        { tag: "div", attr: { class: "menu-dropdown" }, children: moreOptions(mode).map(option => ({ tag: "button", attr: { class: "menu-item", type: "button" }, children: [option], events: { click: event => menuAction(option, comment, event) } })) }
    ] };
}
function authorPortal(alias) { return { tag: "a", attr: { class: "comment-author-link awtsmoos-author-crown", href: `/@${encodeURIComponent(alias)}`, target: "_blank", title: `Open @${alias}` }, children: [`@${alias}`] }; }
function header(comment, mode) {
    if (mode === "inline") return { tag: "header", attr: { class: "awtsmoos-comment-card-header awtsmoos-inline-card-header" }, children: [{ tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [coordOf(comment)] }, moreMenu(comment, mode)] };
    const alias = aliasOf(comment);
    return { tag: "header", attr: { class: "awtsmoos-comment-card-header" }, children: [
        { tag: "div", attr: { class: "awtsmoos-comment-avatar" }, children: [String(alias).charAt(0).toUpperCase()] },
        { tag: "div", attr: { class: "awtsmoos-comment-heading" }, children: [authorPortal(alias), { tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [coordOf(comment)] }] }
    ] };
}
function titleBand(comment) { const title = cleanTitleOf(comment); return title ? { tag: "div", attr: { class: "awtsmoos-comment-title-band", dir: "auto" }, children: [title] } : null; }
export function makeSharedCommentCard(comment, { mode = "sidebar" } = {}) {
    if (!comment) return document.createComment("No comment");
    const alias = aliasOf(comment);
    const kind = getCommentPlacementKind(comment);
    const modeClass = mode === "inline" ? "inline-comment awtsmoos-inline-commentary-root awtsmoos-inline-card-v3 awtsmoos-readable-inline-card" : "awtsmoos-sidebar-comment-card";
    const classes = ["comment-content", "awtsmoos-card", "awtsmoos-shared-comment-card", modeClass, kind === "summary" ? "awtsmoos-summary-comment" : "", isAliasInline(alias) ? "is-inline-enabled" : ""].filter(Boolean).join(" ");
    const card = BlueprintManifestor.manifest({ tag: "article", attr: { class: classes, "data-cid": comment.id, "data-alias": alias, "data-from-alias": alias, "data-comment-kind": kind, id: `comment-${comment.id}`, dir: "auto" }, children: [header(comment, mode), titleBand(comment), { tag: "div", attr: { class: "comment-text-root awtsmoos-comment-body", dir: "auto" } }, mode === "sidebar" ? sidebarActionDock(comment) : null, mode === "sidebar" ? moreMenu(comment, mode) : null] });
    populateCommentElement(comment, card.querySelector(".comment-text-root"));
    return card;
}
