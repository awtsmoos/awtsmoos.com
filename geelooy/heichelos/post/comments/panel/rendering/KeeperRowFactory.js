/**
 * B"H
 * @module KeeperRowFactory
 * @description
 * Chapter 24: Each student row becomes a calm dark-card doorway. The Awtsmoos
 * gives every commentator an avatar, a tiny location line, a favorite star, and
 * a dedicated inline switch that no longer fights the main row click.
 */

import { BlueprintManifestor } from "../../../logic/manifestation/BlueprintManifestor.js";
import { isAliasInline } from "../../state.js";
import { toggleInlineForComments } from "../../inline.js";

function initialFor(alias) {
    return String(alias || "?").trim().charAt(0).toUpperCase() || "?";
}

function titleFor(alias) {
    const value = String(alias || "guest").trim();
    return value.startsWith("@") ? value.slice(1) : value;
}

function locationText() {
    const idx = new URLSearchParams(location.search).get("idx");
    if (idx === null || idx === "root") return "On this scroll";
    return `On ${Number(idx) + 1}`;
}

function favoriteButton(alias) {
    return {
        tag: "button",
        attr: { class: "awtsmoos-student-favorite", type: "button", title: `Favorite @${alias}`, "aria-label": `Favorite @${alias}` },
        children: ["☆"],
        events: { click: event => event.stopPropagation() }
    };
}

function labelFor(result, fallbackVisible = false) {
    if (result?.hidden) return "Show inline";
    if (result?.error) return "Inline error";
    if (result?.empty) return "No inline";
    if (result?.visible) return result.inserted ? `Inline ${result.inserted}` : "Inline on";
    return fallbackVisible ? "Hide inline" : "Show inline";
}

function setButtonState(button, result, fallbackVisible = false) {
    const visible = result?.visible ?? fallbackVisible;
    button.classList.remove("is-working", "is-empty", "is-error");
    button.classList.toggle("is-inline", !!visible && !result?.empty && !result?.error);
    button.classList.toggle("is-empty", !!result?.empty);
    button.classList.toggle("is-error", !!result?.error);
    button.setAttribute("aria-pressed", String(!!visible));
    const text = button.querySelector(".inline-toggle-text");
    if (text) text.textContent = labelFor(result, fallbackVisible);
}

function createInlineToggle(alias, isInline) {
    return {
        tag: "button",
        attr: {
            class: `inline-toggle-altar awtsmoos-mini-inline-toggle ${isInline ? "is-inline" : ""}`,
            title: `${isInline ? "Hide" : "Show"} inline comments for @${alias}`,
            type: "button",
            "aria-pressed": String(isInline)
        },
        children: [
            { tag: "span", attr: { class: "inline-toggle-switch awtsmoos-mini-inline-toggle", "aria-hidden": "true" }, children: [{ tag: "span", attr: { class: "inline-toggle-knob awtsmoos-student-avatar" } }] },
            { tag: "span", attr: { class: "inline-toggle-text awtsmoos-student-location" }, children: [isInline ? "Inline on" : "Inline"] }
        ],
        events: { click: async event => {
            event.stopPropagation();
            const button = event.currentTarget;
            button.classList.add("is-working");
            const text = button.querySelector(".inline-toggle-text");
            if (text) text.textContent = "Loading";
            const result = await toggleInlineForComments([], alias);
            setButtonState(button, result);
        } }
    };
}

/**
 * Creates one student/commentator row.
 * @param {string} alias Alias id.
 * @param {Function} triggerAliasTab Opens this student's sidebar comments.
 * @returns {Element} Row element.
 */
export function createKeeperRow(alias, triggerAliasTab) {
    const validAlias = titleFor(alias);
    const isInline = isAliasInline(validAlias);
    const blueprint = {
        tag: "article",
        attr: { class: "keeper-row awtsmoos-list-item awtsmoos-student-row", "data-alias": validAlias },
        children: [
            {
                tag: "button",
                attr: { class: "keeper-portal-trigger awtsmoos-student-open", title: `Read @${validAlias}`, type: "button" },
                children: [
                    { tag: "div", attr: { class: "commentator-avatar awtsmoos-student-avatar" }, children: [initialFor(validAlias)] },
                    { tag: "div", attr: { class: "awtsmoos-student-copy" }, children: [
                        { tag: "strong", attr: { class: "commentator-name awtsmoos-student-name" }, children: [validAlias] },
                        { tag: "span", attr: { class: "awtsmoos-student-location" }, children: [locationText()] }
                    ] }
                ],
                events: { click: event => {
                    event.stopPropagation();
                    triggerAliasTab(validAlias);
                } }
            },
            { tag: "div", attr: { class: "keeper-controls awtsmoos-student-controls" }, children: [createInlineToggle(validAlias, isInline), favoriteButton(validAlias)] }
        ]
    };
    return BlueprintManifestor.manifest(blueprint);
}
