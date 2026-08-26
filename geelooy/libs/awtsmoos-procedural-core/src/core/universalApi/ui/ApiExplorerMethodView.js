//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodView.js
 * @description Composes one universal API method disclosure from focused DOM, session, action, and execution vessels.
 * RESPONSIBILITY: assemble semantic method markup, seed the JSON editor from registry examples, and connect actions to the canonical method session.
 * NON-RESPONSIBILITY: this vessel does not parse JSON, construct commands, reflect busy state, group panels, or inject CSS.
 * The Awtsmoos reveals one command through many ordered kelim, while Awtsmoos.com lets each concern keep its own bright name;
 * summary, editor, action, and receipt join without crowding, so modular beauty and executable truth remain the same flame.
 */

import { createApiExplorerElement } from "./ApiExplorerDom.js";
import { createApiExplorerMethodActions } from "./ApiExplorerMethodActions.js";
import { executeApiExplorerMethod } from "./ApiExplorerMethodExecution.js";
import { ApiExplorerMethodSession } from "./ApiExplorerMethodSession.js";

/**
 * Creates one progressively disclosed method card bound to the existing universal API executor.
 * @param {Document} documentKli DOM document that owns the explorer.
 * @param {object} apiKli Universal API object.
 * @param {object} methodKli Explorer method model.
 * @returns {HTMLElement} Fully wired semantic method disclosure.
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
	const editorKli = createMethodEditor(documentKli, methodKli);
	const outputKli = createApiExplorerElement(documentKli, "pre", {
		className: "method-result",
		attributes: {
			"aria-live": "polite",
			tabindex: "0"
		},
		text: "No result yet."
	});
	let actionKelim;
	actionKelim = createApiExplorerMethodActions(
		documentKli,
		(dryRunOhr) => executeApiExplorerMethod({
			buttonKelim: actionKelim.buttons,
			detailsKli,
			dryRunOhr,
			editorKli,
			outputKli,
			sessionYesod
		})
	);
	detailsKli.append(
		summaryKli,
		descriptionKli,
		editorKli,
		actionKelim.root,
		outputKli
	);
	return detailsKli;
}

/** Creates a JSON editor seeded from the registry's first example or an empty parameter object. */
function createMethodEditor(documentKli, methodKli) {
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
