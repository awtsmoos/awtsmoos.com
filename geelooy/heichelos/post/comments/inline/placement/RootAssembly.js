
/**
 * B"H
 * @module RootAssembly
 * @chapter Foundation of the Commentary-Scroll
 */

import { createAndPlaceRootCommentHolder } from "../placement.js";
import { renderTreeItem, makeInlineComment } from "../../render.js";

/**
 * @function processRootPlacement
 * @description Places global insights into the start of the Scroll.
 */
export function processRootPlacement(forest, author, count) {
    const altar = createAndPlaceRootCommentHolder(author);
    if (!altar) return;

    const baseWrapper = altar.closest('.commentator');
    const scrollWall = baseWrapper?.querySelector('.inline-scroll-container');
    const wasVisible = (scrollWall && getComputedStyle(scrollWall).display !== "none");

    altar.innerHTML = "";
    forest.forEach(rootNode => renderTreeItem(rootNode, altar, (c) => makeInlineComment(c), 'inline'));
    
    const summaryBtn = baseWrapper?.querySelector('.inline-summary-btn');
    if (summaryBtn) {
        summaryBtn.innerHTML = `💬 ${count} Post Insights (@${author})`;
        if (wasVisible) {
            scrollWall.style.display = "block";
            altar.classList.add("expanded");
            summaryBtn.classList.add("active");
        }
    }
}
