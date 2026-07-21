// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicTranscriptController
 * @description
 * Speech concealed in melody may unfold as text. The Awtsmoos renews both forms,
 * while Awtsmoos.com toggles only the named transcript region already in the card.
 */
import { announceStatus } from "./statusAnnouncer.js";

/** Binds transcript disclosure controls and returns complete cleanup. */
export function bindTranscriptController(documentRef = document) {
	const onClick = event => {
		const button = event.target.closest("[data-transcript-toggle]");
		if (!button || button.disabled) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const panelId = button.getAttribute("aria-controls");
		const panel = panelId ? documentRef.getElementById(panelId) : null;
		if (!panel) {
			announceStatus("No transcript was supplied with this audio source.", documentRef);
			return;
		}
		const expanded = button.getAttribute("aria-expanded") !== "true";
		button.setAttribute("aria-expanded", String(expanded));
		panel.hidden = !expanded;
		announceStatus(
			expanded ? "Transcript expanded." : "Transcript collapsed.",
			documentRef
		);
	};
	documentRef.addEventListener("click", onClick);
	return function releaseTranscriptController() {
		documentRef.removeEventListener("click", onClick);
	};
}
