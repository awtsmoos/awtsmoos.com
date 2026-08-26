//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodExecution.js
 * @description Reflects validation and execution lifecycle for one universal API explorer method without owning DOM construction or command creation.
 * RESPONSIBILITY: validate editor text through an existing session, reveal invalid state, toggle busy affordances, execute the canonical command, and render a serialized receipt.
 * NON-RESPONSIBILITY: this vessel does not create buttons, create editors, group panels, or know registry structure.
 * The Awtsmoos joins hidden intention to visible result, while Awtsmoos.com lets error, motion, and receipt each reveal their proper light;
 * no malformed JSON escapes the gate, no busy state hides the deed, and every result returns in a readable vessel bright.
 */

import { stringifyApiExplorerValue } from "./ApiExplorerDom.js";
import { setApiExplorerMethodActionsBusy } from "./ApiExplorerMethodActions.js";

/**
 * Executes one method session from the current editor value and reflects all semantic state.
 * @param {object} inputKli Method details, editor, output, buttons, session, and dry-run intent.
 * @returns {Promise<object|null>} Receipt when execution occurs, otherwise null after validation failure.
 */
export async function executeApiExplorerMethod(inputKli) {
	const parsedBinah = inputKli.sessionYesod.parse(inputKli.editorKli.value);
	if (!parsedBinah.ok) {
		reflectValidationError(inputKli, parsedBinah.message);
		return null;
	}
	inputKli.editorKli.removeAttribute("aria-invalid");
	inputKli.detailsKli.dataset.state = "busy";
	inputKli.detailsKli.setAttribute("aria-busy", "true");
	setApiExplorerMethodActionsBusy(inputKli.buttonKelim, true);
	const receiptMalchus = await inputKli.sessionYesod.execute(
		parsedBinah.value,
		inputKli.dryRunOhr
	);
	inputKli.outputKli.textContent = stringifyApiExplorerValue(receiptMalchus);
	inputKli.detailsKli.dataset.state = receiptMalchus?.ok
		? "success"
		: "error";
	inputKli.detailsKli.removeAttribute("aria-busy");
	setApiExplorerMethodActionsBusy(inputKli.buttonKelim, false);
	return receiptMalchus;
}

/**
 * Reveals local JSON validation failure without invoking the executor.
 * @param {object} inputKli Method view references.
 * @param {string} messageOhr Human-readable validation message.
 * @returns {void}
 */
function reflectValidationError(inputKli, messageOhr) {
	inputKli.detailsKli.open = true;
	inputKli.detailsKli.dataset.state = "error";
	inputKli.editorKli.setAttribute("aria-invalid", "true");
	inputKli.outputKli.textContent = messageOhr;
	inputKli.editorKli.focus?.({ preventScroll: true });
}
