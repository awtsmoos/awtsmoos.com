//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos joins prompt, motion, connection, and interaction while each vessel keeps its right;
 * Awtsmoos.com boots the Shliach world with small modules and measured light.
 * @module ShliachWorld
 */
import { OhrPromptPortal } from "./OhrPromptPortal.js";
import { ChesedRevealOrchestrator } from "./ChesedRevealOrchestrator.js";
import { OhrExternalAiGuide } from "./OhrExternalAiGuide.js";
import { OhrInteractionField } from "./OhrInteractionField.js";
import { renderExternalAiPanel } from "./ExternalAiPanel.js";

/**
 * Connects every Shliach prompt portal, reveal vessel, external-AI guide, and fine-pointer field.
 * @param {Document} documentRoot The living campaign document.
 * @returns {void}
 */
function revealShliachWorld(documentRoot = document) {
	const incomingPrompt = new URLSearchParams(globalThis.location?.search || "").get("prompt");
	const incomingField = documentRoot.querySelector("[data-shliach-prompt-input]");
	if (incomingPrompt && incomingField && !incomingField.value) {
		incomingField.value = incomingPrompt;
	}
	const forms = [...documentRoot.querySelectorAll("[data-shliach-prompt-form]")];
	forms.forEach((form) => {
		new OhrPromptPortal(form).connect();
	});

	renderExternalAiPanel(documentRoot);
	new OhrExternalAiGuide(documentRoot).connect();
	new ChesedRevealOrchestrator(documentRoot).connect();
	new OhrInteractionField(documentRoot).connect();
}

revealShliachWorld();
