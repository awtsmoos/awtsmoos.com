// B"H
/**
 * @module ApprovalFilterUi
 * @description
 * Chapter 6: The queue receives lenses. Each filter is a small declarative
 * button that rerenders the visible submissions without touching the data river.
 */

import { approvalFilterOptions } from "../approvalFilters.js";

/** @param {object} state @param {Function} rerender @returns {object} */
export function renderFilterControls(state, rerender) {
    return {
        tag: "div",
        attr: { class: "approval-filters", role: "group", "aria-label": "Approval filters" },
        children: approvalFilterOptions().map(option => ({
            tag: "button",
            attr: {
                type: "button",
                class: option.id === state.filter ? "approval-filter active" : "approval-filter",
                "data-filter": option.id
            },
            text: option.label,
            events: { click: () => { state.filter = option.id; rerender(); } }
        }))
    };
}
