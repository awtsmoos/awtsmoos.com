// B"H
// Boruch Hashem
// Blessed is He
/**
 * Speech concealed in melody may unfold as text. The Awtsmoos renews both
 * forms, while Awtsmoos.com expands only transcript content actually supplied.
 */

import { announceStatus } from "./statusAnnouncer.js";

/**
 * Binds transcript disclosure controls.
 * @param {Document} documentRef Active document.
 * @returns {Function} Cleanup callback.
 */
export function bindTranscriptController(documentRef = document) {
	const onClick = (event) => {
		const button = event.target.closest("[data-transcript-toggle]");
		if (!button) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const article = button.closest("[data-cosmic-post]");
		const transcript = article?.__cosmicModel?.raw?.transcript;
		if (!transcript) {
			announceStatus("No transcript was supplied with this audio source.", documentRef);
			return;
		}
		let panel = article.querySelector("[data-cosmic-transcript]");
		if (!panel) {
			panel = documentRef.createElement("div");
			panel.className = "cosmic-transcript";
			panel.dataset.cosmicTranscript = "";
			panel.textContent = String(transcript);
			button.closest(".cosmic-audio")?.append(panel);
		}
		const expanded = button.getAttribute("aria-expanded") !== "true";
		button.setAttribute("aria-expanded", String(expanded));
		panel.hidden = !expanded;
		announceStatus(expanded ? "Transcript expanded." : "Transcript collapsed.", documentRef);
	};
	documentRef.addEventListener("click", onClick);
	return () => documentRef.removeEventListener("click", onClick);
}
