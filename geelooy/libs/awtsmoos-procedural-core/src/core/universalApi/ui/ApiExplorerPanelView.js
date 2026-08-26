//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerPanelView.js
 * @description Groups universal API methods into retractable semantic panels without owning execution or registry discovery.
 * RESPONSIBILITY: render one panel disclosure, summarize method count/expert density, and compose the focused method views beneath it.
 * NON-RESPONSIBILITY: this vessel does not parse JSON, execute commands, generate models, inject CSS, or mutate registry definitions.
 * The Awtsmoos gathers many particular lights beneath one ordered name, while Awtsmoos.com lets each panel open only when its wisdom is sought;
 * complexity rests behind a clear summary, expert depth stays near, and no wall of controls overwhelms the eye before thought.
 */

import { createApiExplorerElement } from "./ApiExplorerDom.js";
import { createApiExplorerMethodView } from "./ApiExplorerMethodView.js";

/**
 * Creates one retractable panel containing all methods assigned to the model panel.
 * @param {Document} documentKli DOM document that owns the explorer.
 * @param {object} apiKli Universal API object.
 * @param {object} panelKli Panel model containing id and method descriptors.
 * @param {object} [optionsKli={}] Optional initial-open policy.
 * @returns {HTMLElement} Semantic panel disclosure.
 */
export function createApiExplorerPanelView(
	documentKli,
	apiKli,
	panelKli,
	optionsKli = {}
) {
	const expertCount = panelKli.methods.filter((methodKli) => methodKli.expert).length;
	const panelYesod = createApiExplorerElement(documentKli, "details", {
		className: "panel",
		attributes: {
			"data-api-panel": panelKli.id,
			"data-expert-count": expertCount
		}
	});
	panelYesod.open = Boolean(optionsKli.open);
	panelYesod.append(createApiExplorerElement(documentKli, "summary", {
		className: "panel-summary",
		text: `${panelKli.id} · ${panelKli.methods.length}`
	}));
	const methodsKli = createApiExplorerElement(documentKli, "div", {
		className: "panel-methods"
	});
	for (const methodKli of panelKli.methods) {
		methodsKli.append(
			createApiExplorerMethodView(documentKli, apiKli, methodKli)
		);
	}
	panelYesod.append(methodsKli);
	return panelYesod;
}
