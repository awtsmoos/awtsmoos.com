// B"H
/**
 * @module ApprovalView
 * @description
 * Chapter 1: The Gate That Wore The Wrong Garment.
 *
 * The sidebar approval chamber is declared as data, then given a body through
 * the GenesisEngine. A browser module request is very strict: when the path is
 * wrong, the server may answer with a JSON error scroll, and the browser will
 * reject it as a false garment over JavaScript light. This module now walks
 * three chambers upward from `comments/panel/approvals/` back to `post/`, then
 * descends into `functions/dom/GenesisEngine.js`, so the revealed vessel is the
 * real module and not a JSON mask.
 *
 * In the mashal of the Awtsmoos: the blueprint, the queue, and the cards are
 * not chaotic strings. They are measured vessels. The Engine gives each vessel
 * a visible limb, while the approval state flows like hidden speech into form.
 */

import { GenesisEngine } from "../../../functions/dom/GenesisEngine.js";
import { approvalPassesFilter } from "../approvalFilters.js";
import { renderCard } from "./card.js";
import { coordinateFor } from "./data.js";
import { renderFilterControls } from "./filters.js";

/**
 * Builds the empty approval state as a GenesisEngine blueprint.
 *
 * @param {object} payload - Server payload that may contain an error message.
 * @returns {object} Structured DOM blueprint for an empty approval chamber.
 */
export function emptyBlueprint(payload) {
    return {
        tag: "div",
        attr: { class: "approval-empty" },
        children: [
            { tag: "div", attr: { class: "approval-empty-icon" }, text: "✓" },
            { tag: "h3", text: payload?.error?.message || payload?.error || "No submissions waiting." },
            { tag: "p", text: "When comments need approval, they will appear here instantly." }
        ]
    };
}

/**
 * Builds the approval queue shell as pure data.
 *
 * @param {Array<object>} submissions - Submitted comments waiting for review.
 * @returns {object} Section blueprint that receives filter controls and cards.
 */
export function queueBlueprint(submissions) {
    return {
        tag: "section",
        attr: { class: "approval-queue" },
        children: [
            {
                tag: "header",
                attr: { class: "approval-hero" },
                children: [
                    { tag: "span", attr: { class: "approval-count" }, text: String(submissions.length) },
                    {
                        tag: "div",
                        children: [
                            { tag: "h2", text: "Approval Queue" },
                            { tag: "p", text: "Review submitted comments before they enter the living text." }
                        ]
                    }
                ]
            }
        ]
    };
}

/**
 * Replaces queue cards according to the active filter.
 *
 * @param {HTMLElement} list - Manifested approval queue section.
 * @param {Array<object>} submissions - Candidate submissions.
 * @param {object} state - Mutable local view state containing `filter`.
 * @returns {void}
 */
export function mountCards(list, submissions, state) {
    const cards = submissions.filter(item => approvalPassesFilter(item, state.filter, coordinateFor));
    list.querySelectorAll(".approval-card, .approval-empty-inline").forEach(node => node.remove());
    cards
        .map(item => GenesisEngine.manifest(renderCard(item, list)))
        .forEach(card => list.appendChild(card));

    if (cards.length) return;

    list.appendChild(GenesisEngine.manifest({
        tag: "div",
        attr: { class: "approval-empty-inline" },
        text: "No submissions match this filter."
    }));
}

/**
 * Manifests the full approval queue into a sidebar tab.
 *
 * @param {HTMLElement} actualTab - Sidebar tab body to receive the queue.
 * @param {Array<object>} submissions - Normalized submissions from the API.
 * @returns {void}
 */
export function renderQueue(actualTab, submissions) {
    const state = { filter: "all" };
    const list = GenesisEngine.manifest(queueBlueprint(submissions));
    const rerender = () => mountCards(list, submissions, state);

    list.appendChild(GenesisEngine.manifest(renderFilterControls(state, rerender)));
    rerender();
    actualTab.appendChild(list);
}
