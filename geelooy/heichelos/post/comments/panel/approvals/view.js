// B"H
/**
 * @module ApprovalView
 * @description
 * Chapter 6: The approval chamber is declared as data. Empty states, hero, and
 * card mounting flow through GenesisEngine without raw HTML clearing.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { approvalPassesFilter } from "../approvalFilters.js";
import { renderCard } from "./card.js";
import { coordinateFor } from "./data.js";
import { renderFilterControls } from "./filters.js";

/** @param {object} payload @returns {object} */
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

/** @param {Array<object>} submissions @returns {object} */
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
                    { tag: "div", children: [{ tag: "h2", text: "Approval Queue" }, { tag: "p", text: "Review submitted comments before they enter the living text." }] }
                ]
            }
        ]
    };
}

/** @param {HTMLElement} list @param {Array<object>} submissions @param {object} state */
export function mountCards(list, submissions, state) {
    const cards = submissions.filter(item => approvalPassesFilter(item, state.filter, coordinateFor));
    list.querySelectorAll(".approval-card, .approval-empty-inline").forEach(node => node.remove());
    cards.map(item => GenesisEngine.manifest(renderCard(item, list))).forEach(card => list.appendChild(card));
    if (cards.length) return;
    list.appendChild(GenesisEngine.manifest({ tag: "div", attr: { class: "approval-empty-inline" }, text: "No submissions match this filter." }));
}

/** @param {HTMLElement} actualTab @param {Array<object>} submissions */
export function renderQueue(actualTab, submissions) {
    const state = { filter: "all" };
    const list = GenesisEngine.manifest(queueBlueprint(submissions));
    const rerender = () => mountCards(list, submissions, state);
    list.appendChild(GenesisEngine.manifest(renderFilterControls(state, rerender)));
    rerender();
    actualTab.appendChild(list);
}
