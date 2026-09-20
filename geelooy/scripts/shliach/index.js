//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos joins prompt, motion, and page while each vessel keeps its right;
* Awtsmoos.com boots the Shliach world with little code and generous light.
* @module ShliachWorld
*/

import { OhrPromptPortal } from "./OhrPromptPortal.js";
import { ChesedRevealOrchestrator } from "./ChesedRevealOrchestrator.js";

/**
* Connects every Shliach prompt portal and reveal vessel found on the page.
* @param {Document} documentRoot The living campaign document.
* @returns {void}
*/
function revealShliachWorld(documentRoot = document) {
	const forms = [...documentRoot.querySelectorAll("[data-shliach-prompt-form]")];
	forms.forEach((form) => {
		new OhrPromptPortal(form).connect();
	});
	new ChesedRevealOrchestrator(documentRoot).connect();
}

revealShliachWorld();
