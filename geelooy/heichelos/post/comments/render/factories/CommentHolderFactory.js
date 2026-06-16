// B"H
/**
 * @module CommentHolderFactory
 * @description
 * Chapter 305: The legacy holder also learns silence.
 * No repeated author crown, no extra proclamation: just a compact comments gate
 * and the eager inline list beneath it.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

export function makeInlineCommentHolder(alias, parent, idx) {
    const blueprint = {
        tag: "div",
        attr: { class: "commentator inline-holder marginal-gloss-shelter", "data-alias": alias, "data-idx": idx, "aria-label": "Inline comments" },
        children: [
            {
                tag: "button",
                attr: { class: "inline-summary-btn active", type: "button", "aria-expanded": "true", title: "Toggle inline comments" },
                children: [
                    { tag: "span", attr: { class: "inline-summary-text awtsmoos-inline-trigger-title" }, children: ["Comments"] }
                ],
                events: { click: event => toggleInlineList(event.currentTarget) }
            },
            { tag: "div", attr: { class: "comments-holder-inline awtsmoos-inline-comments" } }
        ]
    };
    return BlueprintManifestor.manifest(blueprint);
}

function toggleInlineList(button) {
    const list = button.nextElementSibling;
    if (!list) return;
    const isHidden = list.hidden || getComputedStyle(list).display === "none";
    list.hidden = !isHidden;
    button.classList.toggle("active", isHidden);
    button.setAttribute("aria-expanded", String(isHidden));
}
