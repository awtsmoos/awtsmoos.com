//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodActions.js
 * @description Creates the small paired action row used by one universal API method card.
 * RESPONSIBILITY: render accessible dry-run and execute buttons, bind them to one callback, and expose a tiny busy-state helper for callers.
 * NON-RESPONSIBILITY: this vessel does not parse parameters, invoke APIs, render receipts, own method sessions, or style anything globally.
 * The Awtsmoos contains action before motion, while Awtsmoos.com gives each deed a clear finite gate;
 * preview and execution stand side by side, distinct in intention yet joined to one lawful state.
 */

import { createApiExplorerElement } from "./ApiExplorerDom.js";

/**
 * Creates paired dry-run and execute controls for one method card.
 * @param {Document} documentKli DOM document that owns the explorer.
 * @param {(dryRunOhr: boolean) => void} invokeOhr Shared invocation callback.
 * @returns {{root: HTMLElement, buttons: HTMLButtonElement[]}} Action row and owned buttons.
 */
export function createApiExplorerMethodActions(documentKli, invokeOhr) {
	const rootKli = createApiExplorerElement(documentKli, "div", {
		className: "method-actions"
	});
	const dryRunKli = createButton(
		documentKli,
		"button",
		"Dry run",
		() => invokeOhr(true)
	);
	const executeKli = createButton(
		documentKli,
		"button-primary",
		"Execute",
		() => invokeOhr(false)
	);
	rootKli.append(dryRunKli, executeKli);
	return {
		buttons: [dryRunKli, executeKli],
		root: rootKli
	};
}

/**
 * Reflects one busy state across a method card's owned action controls.
 * @param {HTMLButtonElement[]} buttonKelim Buttons returned by the action factory.
 * @param {boolean} busyOhr Whether execution is in flight.
 * @returns {void}
 */
export function setApiExplorerMethodActionsBusy(buttonKelim, busyOhr) {
	for (const buttonKli of buttonKelim) {
		buttonKli.disabled = Boolean(busyOhr);
		buttonKli.dataset.loading = String(Boolean(busyOhr));
	}
}

/** Creates one fully typed explorer action button with one click binding. */
function createButton(documentKli, classNameOhr, labelOhr, invokeOhr) {
	const buttonKli = createApiExplorerElement(documentKli, "button", {
		className: classNameOhr,
		text: labelOhr
	});
	buttonKli.type = "button";
	buttonKli.addEventListener("click", invokeOhr);
	return buttonKli;
}
