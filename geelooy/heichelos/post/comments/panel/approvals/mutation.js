// B"H
/**
 * @module ApprovalMutation
 * @description
 * Chapter 6: The queue moves optimistically, but mercy remains. If the network
 * rejects the decree, the card returns to its exact place.
 */

import { emitAwtsmoosEvent } from "../../state/eventBus.js";
import { decide } from "./data.js";

function setCardLoading(card, loading, label = "") {
    card.dataset.loading = loading ? "true" : "false";
    card.querySelectorAll("button").forEach(button => {
        button.disabled = loading;
        if (loading && label) button.dataset.originalText = button.textContent;
        if (loading && button.classList.contains(`approval-${label}`)) button.textContent = `${label}ing...`;
        else if (!loading && button.dataset.originalText) button.textContent = button.dataset.originalText;
    });
}

function ensureVisibleListMessage(list) {
    if (list.children.length) return;
    const empty = document.createElement("div");
    empty.className = "approval-empty-inline";
    empty.textContent = "All visible submissions resolved.";
    list.appendChild(empty);
}

/** @param {object} options Decision options. */
export async function optimisticDecision({ comment, action, card, list }) {
    const nextSibling = card.nextSibling;
    const parent = card.parentNode;
    setCardLoading(card, true, action);
    card.remove();
    try {
        const result = await decide(comment, action);
        if (result?.error) throw new Error(result.error.message || result.error);
        emitAwtsmoosEvent("approval:queue:changed", { action, comment });
    } catch (error) {
        if (nextSibling) parent.insertBefore(card, nextSibling);
        else parent.appendChild(card);
        setCardLoading(card, false);
        console.error('B"H approval mutation failed', error);
        emitAwtsmoosEvent("approval:queue:error", { action, comment, error });
    }
    ensureVisibleListMessage(list);
}
