// B"H
/**
 * @module RootAssembly
 * @description
 * Chapter 92: Root placement respects classed visibility.
 * No direct display writes. The holder's hidden attribute is the only gate,
 * and CSS owns the shape of the inline chamber.
 */

import { createAndPlaceRootCommentHolder } from "../placement.js";
import { renderTreeItem, makeInlineComment } from "../../render.js";

export function processRootPlacement(forest, author, count) {
    const altar = createAndPlaceRootCommentHolder(author);
    if (!altar) return;

    const baseWrapper = altar.closest(".commentator");
    const wasVisible = altar && !altar.hidden;
    altar.innerHTML = "";
    forest.forEach(rootNode => renderTreeItem(rootNode, altar, comment => makeInlineComment(comment), "inline"));

    const summaryBtn = baseWrapper?.querySelector(".inline-summary-btn");
    if (!summaryBtn) return;
    summaryBtn.innerHTML = `<span class="awtsmoos-inline-trigger-sigil">💬</span><span class="awtsmoos-inline-trigger-copy"><strong class="awtsmoos-inline-trigger-title">Post Insights</strong><span class="awtsmoos-inline-trigger-subtitle">${count} from @${author}</span></span>`;
    altar.hidden = !wasVisible;
    summaryBtn.classList.toggle("active", wasVisible);
    summaryBtn.setAttribute("aria-expanded", String(wasVisible));
}
