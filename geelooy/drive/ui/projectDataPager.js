//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataPager
 * @description
 * Renders touch-friendly Database Studio paging from server-returned offsets only.
 * The browser never guesses collection length or invents a continuation cursor.
 */

import { actionButton, createElement } from "./dom.js";

/**
 * Creates Previous/Next controls whose authority comes from the latest page evidence.
 * @param {{onNavigate?:Function}} options Pager dependencies.
 * @returns {{element:HTMLElement,setEvidence:Function}} Pager surface and updater.
 */
export function createProjectDataPager(options = {}) {
	let evidence = {};
	const label = createElement("span", { className: "project-data-meta", text: "No documents" });
	const previous = actionButton("Previous", () => navigate(evidence.previousOffset));
	const next = actionButton("Next", () => navigate(evidence.nextOffset));
	const element = createElement("div", {
		className: "project-data-actions project-data-pagination",
		children: [previous, label, next]
	});
	update();
	return { element, setEvidence };

	function setEvidence(nextEvidence = {}) {
		evidence = nextEvidence || {};
		update();
	}

	async function navigate(offset) {
		if (offset === null || offset === undefined) return;
		previous.disabled = true;
		next.disabled = true;
		try {
			await options.onNavigate?.(offset);
		} finally {
			update();
		}
	}

	function update() {
		label.textContent = paginationLabel(evidence);
		previous.disabled = evidence.previousOffset === null || evidence.previousOffset === undefined;
		next.disabled = evidence.nextOffset === null || evidence.nextOffset === undefined;
	}
}

/** @param {object} evidence Server page evidence. @returns {string} Human page range. */
export function paginationLabel(evidence = {}) {
	const offset = Math.max(0, Number(evidence.offset) || 0);
	const returned = Math.max(0, Number(evidence.returned ?? evidence.documents?.length) || 0);
	const total = Math.max(returned, Number(evidence.total) || 0);
	if (!returned) return total ? `0 of ${total}` : "No documents";
	return `${offset + 1}–${offset + returned} of ${total}`;
}
