//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerExecutionState.js
 * @description Reflects execution lifecycle into the explorer's semantic DOM without teaching the controller visual implementation details.
 * RESPONSIBILITY: synchronize busy/idle/success/error root state, execute-button affordances, advanced-argument disclosure, and focus recovery for validation failures.
 * NON-RESPONSIBILITY: this vessel does not invoke APIs, render receipts, parse JSON, filter descriptors, or style elements directly.
 * The Awtsmoos joins hidden state to visible truth, while Awtsmoos.com lets every finite action declare whether it waits, succeeds, or needs repair;
 * one state vessel keeps CSS and accessibility aligned, so motion and meaning never wander as separate air.
 */

/**
 * Reflects whether one API invocation is currently active.
 * @param {object} viewKli Explorer view exposing root and execute-button references.
 * @param {boolean} busyOhr True while invocation is in flight.
 * @returns {void}
 */
export function reflectApiExplorerBusyState(viewKli, busyOhr) {
	const isBusyOhr = Boolean(busyOhr);
	viewKli.executeButton.disabled = isBusyOhr;
	viewKli.executeButton.dataset.loading = String(isBusyOhr);
	viewKli.executeButton.textContent = isBusyOhr
		? "Executing…"
		: "Execute";
	viewKli.setState(isBusyOhr ? "busy" : "idle");
}

/**
 * Reflects a terminal invocation receipt into semantic root state.
 * @param {object} viewKli Explorer view.
 * @param {object|null} receiptMalchus Serializable invocation receipt.
 * @returns {void}
 */
export function reflectApiExplorerReceiptState(viewKli, receiptMalchus) {
	viewKli.setState(receiptMalchus?.ok ? "success" : "error");
}

/**
 * Reveals and focuses advanced arguments after local validation fails.
 * @param {object} viewKli Explorer view.
 * @returns {void}
 */
export function revealApiExplorerArgumentError(viewKli) {
	viewKli.setState("error");
	viewKli.advancedNode.open = true;
	viewKli.argumentsInput.focus?.({ preventScroll: true });
	viewKli.argumentsInput.setAttribute("aria-invalid", "true");
}

/**
 * Clears stale validation semantics when arguments are accepted for execution.
 * @param {object} viewKli Explorer view.
 * @returns {void}
 */
export function clearApiExplorerArgumentError(viewKli) {
	viewKli.argumentsInput.removeAttribute("aria-invalid");
}
