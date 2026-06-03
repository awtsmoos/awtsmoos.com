// B"H
/**
 * @module SidebarCardFactory
 * @description
 * Chapter 89: A student comment becomes one readable card.
 *
 * The sidebar must be calm on mobile. Profile, locate, reply, share, copy, and
 * more actions remain present, but they wrap beneath the text instead of
 * crowding the first line or forcing horizontal pressure.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { handleMenuOption } from "../actions.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { expandPathToComment } from "../tree.js";

export function makeHTMLFromComment(comment) {
    if (!comment) return document.createComment("Silence");
    const manifest = BlueprintManifestor.manifest({
        tag: "article",
        attr: { class: "comment-content awtsmoos-card awtsmoos-sidebar-comment-card", "data-cid": comment.id, id: `comment-${comment.id}` },
        children: [
            createMetaRow(comment),
            { tag: "div", attr: { class: "comment-text-root awtsmoos-sidebar-comment-body" } },
            { tag: "div", attr: { class: "comment-toolbar" }, children: [createLocateBtn(comment), ...createActionStrip(comment), createActionMenu(comment)].filter(Boolean) }
        ]
    });
    populateCommentElement(comment, manifest.querySelector(".comment-text-root"));
    return manifest;
}

function createMetaRow(comment) {
    const alias = comment.author || comment.aliasId || "unknown";
    return {
        tag: "header",
        attr: { class: "comment-meta-row" },
        children: [
            { tag: "a", attr: { class: "comment-author-link", href: `/@${encodeURIComponent(alias)}`, target: "_blank" }, children: [`@${alias}`] },
            { tag: "button", attr: { class: "comment-chip-action profile-chip", type: "button", title: "Copy profile link" }, children: ["Profile"], events: { click: event => copyProfile(event, alias) } }
        ]
    };
}

function createActionStrip(comment) {
    return [
        makeChip("Reply", event => handleMenuOption("Reply", comment, event.target)),
        makeChip("Share", () => shareComment(comment)),
        makeChip("Copy", event => handleMenuOption("Copy", comment, event.target))
    ];
}

function makeChip(label, action) {
    return { tag: "button", attr: { class: "comment-chip-action", type: "button", title: label }, children: [label], events: { click: async event => {
        event.stopPropagation();
        await action(event);
    } } };
}

function createLocateBtn(comment) {
    if (!isAliasInline(comment.author)) return null;
    return makeChip("Locate", event => {
        const inlineEl = document.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
        if (!inlineEl) return;
        expandPathToComment(inlineEl);
        inlineEl.scrollIntoView({ behavior: "smooth", block: "center" });
        inlineEl.classList.add("signal-active");
        setTimeout(() => inlineEl.classList.remove("signal-active"), 1400);
    });
}

function createActionMenu(comment) {
    return {
        tag: "details",
        attr: { class: "menu-chariot awtsmoos-comment-more" },
        children: [
            { tag: "summary", attr: { class: "menu-btn comment-chip-action" }, children: ["More"] },
            { tag: "div", attr: { class: "menu-dropdown" }, children: ["Reply", "Copy", "Delete"].map(option => ({
                tag: "button",
                attr: { class: "menu-item", type: "button" },
                children: [option],
                events: { click: event => {
                    event.stopPropagation();
                    handleMenuOption(option, comment, event.target);
                } }
            })) }
        ]
    };
}

async function copyProfile(event, alias) {
    event.stopPropagation();
    await copyText(`${location.origin}/@${encodeURIComponent(alias)}`);
}

async function shareComment(comment) {
    const link = `${location.origin}${location.pathname}${location.search}#comment-${encodeURIComponent(comment.id || "")}`;
    if (navigator.share) {
        try {
            await navigator.share({ title: "Awtsmoos insight", text: comment.content || "", url: link });
            return;
        } catch (_) {}
    }
    await copyText(link);
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }
}
