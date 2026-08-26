//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodView.js
 * @description Renders and operates one universal API method as a semantic, progressively disclosed explorer card.
 * RESPONSIBILITY: connect one method session to description, JSON editor, dry-run/execute controls, accessible busy state, validation feedback, and serialized output.
 * NON-RESPONSIBILITY: this vessel does not group panels, construct registry models, inject CSS, or bypass the canonical API executor.
 * The Awtsmoos conceals depth until the proper vessel opens, while Awtsmoos.com lets one method unfold from name to params to receipt;
 * expert power remains discoverable without becoming clutter, and every execution returns through the same truthful gate complete.
 */

import {
	createApiExplorerElement,
	stringifyApiExplorerValue
} from "./ApiExplorerDom.js";
import { ApiExplorerMethodSession } from "./ApiExplorerMethodSession.js";

/**
 * Creates one method disclosure bound to the canonical executor session.
 * @param {Document} documentKli DOM document that owns the explorer.
 * @param {object} apiKli Universal API object.
 * @param {object} methodKli Explorer method model.
 * @returns {HTMLElement} Fully wired method disclosure.
 */
export function createApiExplorerMethodView(documentKli, apiKli, methodKli) {
	const sessionYesod = new ApiExplorerMethodSession(apiKli, methodKli);
	const detailsKli = createApiExplorerElement(documentKli, "details", {
		className: "method",
		attributes: {
			"data-api-method": methodKli.id,
			"data-expert": String(methodKli.expert)
		}
	});
	const summaryKli = createApiExplorerElement(documentKli, "summary", {
		className: "method-summary",
		text: methodKli.label
	});
	const descriptionKli = createApiExplorerElement(documentKli, "p", {
		className: "method-description",
		text: methodKli.description
	});
	const editorKli = createEditor(documentKli, methodKli);
	const outputKli = createApiExplorerElement(documentKli, "pre", {
		className: "method-result",
		attributes: {
			"aria-live": "polite",
			tabindex: "0"
		},
		text: "No result yet."
	});
	const actionsKli = createActions(
		documentKli,
		(sessionDryRun) => executeMethod(
			detailsKli,
			editorKli,
			outputKli,
			sessionYesod,
			sessionDryRun
		)
	);
	detailsKli.append(
		summaryKli,
		descriptionKli,
		editorKli,
		actionsKli,
		outputKli
	);
	return detailsKli;
}

/** Creates a JSON editor seeded from the first registry example or an empty parameter object. */
function createEditor(documentKli, methodKli) {
	const editorKli = createApiExplorerElement(documentKli, "textarea", {
		className: "method-editor",
		attributes: {
			"aria-label": `${methodKli.label} parameters`,
			spellcheck: "false"
		}
	});
	editorKli.value = JSON.stringify(methodKli.examples?.[0] ?? {}, null, 2);
	return editorKli;
}

/** Creates paired dry-run and execute controls sharing one method session. */
function createActions(documentKli, invokeOhr) {
	const actionsKli = createApiExplorerElement(documentKli, "div", {
		className: "method-actions"
	});
	const dryRunKli = createApiExplorerElement(documentKli, "button", {
		className: "button",
		text: "Dry run"
	});
	const executeKli = createApiExplorerElement(documentKli, "button", {
		className: "button-primary",
		text: "Execute"
	});
	dryRunKli.type = "button";
	executeKli.type = "button";
	dryRunKli.addEventListener("click", () => invokeOhr(true));
	executeKli.addEventListener("click", () => invokeOhr(false));
	actionsKli.append(dryRunKli, executeKli);
	actionsKli.invokeButtons = [dryRunKli, executeKli];
	return actionsKli;
}

/** Validates, executes, and reflects one method invocation without throwing malformed JSON through the UI event loop. */
async function executeMethod(detailsKli, editorKli, outputKli, sessionYesod, dryRunOhr) {
	const parsedBinah = sessionYesod.parse(editorKli.value);
	if (!parsedBinah.ok) {
		detailsKli.dataset.state = "error";
		editorKli.setAttribute("aria-invalid", "true");
		outputKli.textContent = parsedBinah.message;
		return;
	}
	editorKli.removeAttribute("aria-invalid");
	detailsKli.dataset.state = "busy";
	detailsKli.setAttribute("aria-busy", "true");
	for (const buttonKli of detailsKli.querySelectorAll("button")) {
		buttonKli.disabled = true;
	}
	const receiptMalchus = await sessionYesod.execute(parsedBinah.value, dryRunOhr);
	outputKli.textContent = stringifyApiExplorerValue(receiptMalchus);
	detailsKli.dataset.state = receiptMalchus?.ok ? "success" : "error";
	detailsKli.removeAttribute("aria-busy");
	for (const buttonKli of detailsKli.querySelectorAll("button")) {
		buttonKli.disabled = false;
	}
}
