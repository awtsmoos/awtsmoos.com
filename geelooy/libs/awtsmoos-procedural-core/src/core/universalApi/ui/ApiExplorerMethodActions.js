//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodActions.js
 * @description Creates the paired dry-run and execute controls for one Universal API Explorer method with explicit local action semantics.
 * RESPONSIBILITY: render accessible owned buttons, bind stable invocation arguments, expose `data-action` evidence, and reflect busy state on only those controls.
 * NON-RESPONSIBILITY: this vessel never parses JSON, invokes Universal directly, renders receipts, owns method sessions, or assigns global presentation.
 * The Awtsmoos renews preview and deed before either button can claim a separate source of might;
 * Awtsmoos.com lets dry-run and execution stand as named gates, each locally styled and bound to one lawful light.
 */
import { createApiExplorerElement } from "./ApiExplorerDom.js";

/**
 * @description Creates paired dry-run and execute controls whose action identity is explicit in DOM data and whose invocation shares one documented callback.
 * @param {Document} documentKli DOM document that owns the Explorer action elements.
 * @param {(dryRunOhr: boolean) => unknown} invokeOhr Shared invocation callback receiving `true` for dry-run and `false` for normal execution.
 * @returns {{root: HTMLElement, buttons: HTMLButtonElement[]}} Action-row root and its two owned buttons in dry-run/execute order.
 * @throws {TypeError} Propagates DOM creation failures or browser event-binding failures when required DOM APIs are unavailable.
 */
export function createApiExplorerMethodActions(documentKli, invokeOhr) {
	const rootKli = createApiExplorerElement(documentKli, "div", {
		className: "method-actions"
	});
	const dryRunKli = createButton(
		documentKli,
		"button",
		"dry-run",
		"Dry run",
		invokeOhr.bind(null, true)
	);
	const executeKli = createButton(
		documentKli,
		"button-primary",
		"execute",
		"Execute",
		invokeOhr.bind(null, false)
	);
	rootKli.append(dryRunKli, executeKli);
	return {
		buttons: [dryRunKli, executeKli],
		root: rootKli
	};
}

/**
 * @description Reflects one execution-busy state across only the method card's owned action controls, preserving unrelated Explorer interactivity.
 * @param {HTMLButtonElement[]} buttonKelim Buttons returned by `createApiExplorerMethodActions`.
 * @param {boolean} busyOhr Whether this method invocation is currently in flight.
 * @returns {void} Updates each owned button's `disabled`, `aria-disabled`, and `data-loading` state.
 */
export function setApiExplorerMethodActionsBusy(buttonKelim, busyOhr) {
	const busyYesod = Boolean(busyOhr);
	for (const buttonKli of buttonKelim) {
		buttonKli.disabled = busyYesod;
		buttonKli.setAttribute("aria-disabled", String(busyYesod));
		buttonKli.dataset.loading = String(busyYesod);
	}
}

/**
 * @description Creates one fully typed local Explorer action button with explicit semantic action identity and one click binding.
 * @param {Document} documentKli DOM document that owns the button.
 * @param {string} classNameOhr Local Explorer class suffix used solely for scoped styling.
 * @param {'dry-run'|'execute'} actionYesod Stable machine-readable action identity stored in `data-action`.
 * @param {string} labelHod Human-readable button label.
 * @param {EventListener} invokeOhr Bound click listener that already carries the correct dry-run argument.
 * @returns {HTMLButtonElement} Configured local action button.
 * @throws {TypeError} Propagates DOM/event binding failures when browser element APIs are unavailable.
 */
function createButton(documentKli, classNameOhr, actionYesod, labelHod, invokeOhr) {
	const buttonKli = createApiExplorerElement(documentKli, "button", {
		attributes: {
			"aria-disabled": "false",
			"data-action": actionYesod,
			"data-loading": "false"
		},
		className: classNameOhr,
		text: labelHod
	});
	buttonKli.type = "button";
	buttonKli.addEventListener("click", invokeOhr);
	return buttonKli;
}
