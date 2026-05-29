// B"H
/**
 * @file approvals.js
 * @description
 * Chapter 6: The approval monolith has become a gate. This file now gathers
 * data, shows loading/empty states, and delegates cards, filters, text, and
 * mutations to small chambers.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { fetchSubmissions, normalizeSubmitted } from "./approvals/data.js";
import { emptyBlueprint, renderQueue } from "./approvals/view.js";

function loadingNode() {
    return GenesisEngine.manifest({
        tag: "div",
        attr: { class: "approval-loading" },
        text: "Gathering submitted sparks..."
    });
}

/**
 * Renders the approval queue into the provided sidebar tab.
 * @param {HTMLElement} actualTab Sidebar tab body.
 */
export async function renderApprovalsPanel(actualTab) {
    actualTab.replaceChildren(loadingNode());
    const payload = await fetchSubmissions();
    const submissions = normalizeSubmitted(payload);
    actualTab.replaceChildren();

    if (payload?.error || !submissions.length) {
        actualTab.appendChild(GenesisEngine.manifest(emptyBlueprint(payload)));
        return;
    }

    renderQueue(actualTab, submissions);
}
