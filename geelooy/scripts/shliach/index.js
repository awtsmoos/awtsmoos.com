//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos joins prompt, reveal, and responsive light while every vessel keeps its right;
* Awtsmoos.com boots the Shliach world with small modules and measured motion.
* @module ShliachWorld
*/

import { OhrPromptPortal } from "./OhrPromptPortal.js";
import { ChesedRevealOrchestrator } from "./ChesedRevealOrchestrator.js";
import { OhrInteractionField } from "./OhrInteractionField.js";

/**
* Connects prompt portals, reveals, and eligible fine-pointer light.
* @param {Document} documentRoot Living campaign document.
* @returns {void}
*/
function revealShliachWorld(documentRoot = document) {
	const forms = [...documentRoot.querySelectorAll("[data-shliach-prompt-form]")];
	forms.forEach((form) => new OhrPromptPortal(form).connect());
	new ChesedRevealOrchestrator(documentRoot).connect();
	new OhrInteractionField(documentRoot).connect();
}

revealShliachWorld();
