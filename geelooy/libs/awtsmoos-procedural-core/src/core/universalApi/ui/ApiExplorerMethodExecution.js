//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodExecution.js
 * @description Reflects local validation, execution lifecycle, result status, and guaranteed busy-state cleanup for one Universal API Explorer method.
 * RESPONSIBILITY: parse through the existing session, expose invalid/busy/success/error semantics, execute the canonical command, render its receipt, and always restore owned controls.
 * NON-RESPONSIBILITY: this vessel never creates DOM, constructs Universal commands, groups panels, owns registry metadata, or assigns visual CSS policy.
 * The Awtsmoos renews intention, action, and consequence before a status can name the deed in sight;
 * Awtsmoos.com lets every busy gate reopen and every receipt speak plainly, so motion never hides truth beneath its light.
 */
import { stringifyApiExplorerValue } from "./ApiExplorerDom.js";
import { setApiExplorerMethodActionsBusy } from "./ApiExplorerMethodActions.js";
import { setApiExplorerResultState } from "./ApiExplorerResultView.js";

/**
 * @description Executes one method session from the current editor value while guaranteeing that busy affordances are cleared even when unexpected UI-layer work fails.
 * @param {object} inputKli Method-local references containing details, editor, result, buttons, session, and dry-run intent.
 * @returns {Promise<object|null>} Universal receipt when execution completes, or `null` after local validation/unexpected UI failure.
 * @throws {TypeError} Propagates only malformed method-local reference failures that occur before lifecycle handling can begin.
 */
export async function executeApiExplorerMethod(inputKli) {
	const parsedBinah = inputKli.sessionYesod.parse(inputKli.editorKli.value);
	if (!parsedBinah.ok) {
		reflectValidationError(inputKli, parsedBinah.message);
		return null;
	}
	beginExecution(inputKli);
	try {
		const receiptMalchus = await inputKli.sessionYesod.execute(
			parsedBinah.value,
			inputKli.dryRunOhr
		);
		reflectReceipt(inputKli, receiptMalchus);
		return receiptMalchus;
	} catch (errorGevurah) {
		reflectUnexpectedError(inputKli, errorGevurah);
		return null;
	} finally {
		endExecution(inputKli);
	}
}

/**
 * @description Enters semantic busy state after local JSON validation succeeds and before the Universal executor is invoked.
 * @param {object} inputKli Method-local execution references.
 * @returns {void} Mutates only method-card ARIA/data state, result status, and owned action disabled state.
 */
function beginExecution(inputKli) {
	inputKli.editorKli.removeAttribute("aria-invalid");
	inputKli.detailsKli.dataset.state = "busy";
	inputKli.detailsKli.setAttribute("aria-busy", "true");
	setApiExplorerResultState(inputKli.resultKli, "busy");
	setApiExplorerMethodActionsBusy(inputKli.buttonKelim, true);
}

/**
 * @description Reflects one completed Universal receipt as readable output and a success/error semantic state without interpreting domain-specific result contents.
 * @param {object} inputKli Method-local execution references.
 * @param {object} receiptMalchus Universal result envelope returned by the method session.
 * @returns {void} Updates only receipt text and semantic result/card state.
 */
function reflectReceipt(inputKli, receiptMalchus) {
	const stateYesod = receiptMalchus?.ok ? "success" : "error";
	inputKli.resultKli.output.textContent = stringifyApiExplorerValue(receiptMalchus);
	inputKli.detailsKli.dataset.state = stateYesod;
	setApiExplorerResultState(inputKli.resultKli, stateYesod);
}

/**
 * @description Reveals local JSON validation failure without invoking Universal and returns keyboard focus to the invalid editor.
 * @param {object} inputKli Method-local execution references.
 * @param {string} messageOhr Human-readable local JSON validation message.
 * @returns {void} Opens the method, marks the editor invalid, renders the message, and exposes error state.
 */
function reflectValidationError(inputKli, messageOhr) {
	inputKli.detailsKli.open = true;
	inputKli.detailsKli.dataset.state = "error";
	inputKli.editorKli.setAttribute("aria-invalid", "true");
	inputKli.resultKli.output.textContent = String(messageOhr);
	setApiExplorerResultState(inputKli.resultKli, "error");
	inputKli.editorKli.focus?.({ preventScroll: true });
}

/**
 * @description Converts an unexpected UI-layer exception into visible local error evidence without pretending it is a canonical Universal receipt.
 * @param {object} inputKli Method-local execution references.
 * @param {unknown} errorGevurah Unexpected thrown value.
 * @returns {void} Renders a concise error message and exposes error state.
 */
function reflectUnexpectedError(inputKli, errorGevurah) {
	inputKli.detailsKli.dataset.state = "error";
	inputKli.resultKli.output.textContent = errorGevurah instanceof Error
		? errorGevurah.message
		: String(errorGevurah);
	setApiExplorerResultState(inputKli.resultKli, "error");
}

/**
 * @description Clears method-card busy semantics and re-enables only the action buttons owned by this method card.
 * @param {object} inputKli Method-local execution references.
 * @returns {void} Removes busy ARIA state and restores action availability.
 */
function endExecution(inputKli) {
	inputKli.detailsKli.removeAttribute("aria-busy");
	setApiExplorerMethodActionsBusy(inputKli.buttonKelim, false);
}
