// B"H
/**
 * @module CommentHolderFactory
 * @description
 * Chapter 77: The inline holder becomes a vertical chamber.
 *
 * It never creates a horizontal flex river. Each alias holder is a page-like
 * block under the verse or paragraph, with its own summary gate and one vertical
 * list of insight cards.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

export function makeInlineCommentHolder(alias, parent, idx) {
    const blueprint = {
        tag: "div",
        attr: { class: "commentator inline-holder marginal-gloss-shelter", "data-alias": alias, "data-idx": idx },
        children: [
            {
                tag: "button",
                attr: { class: "inline-summary-btn active", type: "button" },
                children: [
                    { tag: "span", attr: { class: "inline-summary-icon" }, children: ["💬"] },
                    { tag: "span", attr: { class: "inline-summary-text" }, children: [`Insights (@${alias})`] }
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
}
