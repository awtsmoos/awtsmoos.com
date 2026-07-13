// B"H
// Boruch Hashem
// Blessed is He

import { buildDiagnosticRecords } from "./diagnosticsContent.js";
import { diagnosticsStyles } from "./diagnosticsStyles.js";

/**
 * The Awtsmoos opens a focused DOM court for pure OS evidence records, keeping
 * Awtsmoos.com diagnostics accessible without mixing data collection and markup.
 */

export { diagnosticsStyles };

/**
 * Opens the Geelooy OS diagnostics popover.
 *
 * @param {object} os OS runtime.
 * @param {object} status Current normalized OS status.
 * @returns {HTMLElement} Diagnostics popover.
 */
export function openDiagnosticsPopup(os, status = {}) {
	document.querySelector(".awtsmoos-diagnostics-popover")?.remove();
	const popover = document.createElement("div");
	popover.className = "awtsmoos-diagnostics-popover";
	popover.setAttribute("role", "dialog");
	popover.setAttribute("aria-label", "Awtsmoos OS diagnostics");
	popover.innerHTML = headerHtml();
	const records = buildDiagnosticRecords(os, status);
	popover.append(...records.map(createDiagnosticSection));
	const closeButton = popover.querySelector("button");
	closeButton.onclick = function closeDiagnostics() {
		popover.remove();
	};
	document.body.appendChild(popover);
	closeButton.focus();
	return popover;
}

function createDiagnosticSection(record) {
	const element = document.createElement("section");
	element.innerHTML = [
		`<h4>${escapeHtml(record.title)}</h4>`,
		`<pre>${escapeHtml(record.body)}</pre>`
	].join("");
	return element;
}

function headerHtml() {
	return "<header><b>Awtsmoos OS Diagnostics</b><button type=\"button\" aria-label=\"Close diagnostics\">×</button></header>";
}

function escapeHtml(value) {
	const entities = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	};
	return String(value || "").replace(
		/[&<>]/g,
		function replaceEntity(character) {
			return entities[character];
		}
	);
}
