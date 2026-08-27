//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerPanelView.js
 * @description Groups Universal API methods into retractable panels whose visible summary exposes domain name, method count, and expert depth as real semantic DOM.
 * RESPONSIBILITY: render one local panel disclosure, expose counts accessibly, and compose focused method views beneath it without flattening progressive disclosure.
 * NON-RESPONSIBILITY: this vessel never parses JSON, executes commands, creates registry models, injects CSS, or invents API metadata.
 * The Awtsmoos gathers many finite commands beneath one name without becoming any boundary or count;
 * Awtsmoos.com lets each panel reveal method and expert depth plainly, so structure guides the eye before complexity can mount.
 */
import { createApiExplorerElement } from "./ApiExplorerDom.js";
import { createApiExplorerMethodView } from "./ApiExplorerMethodView.js";

/**
 * @description Creates one retractable panel containing all methods assigned to a detached Explorer model panel and optionally opens it initially.
 * @param {Document} documentKli DOM document that owns the Explorer panel and all descendant elements.
 * @param {object} apiKli Universal API instance shared by descendant method sessions.
 * @param {object} panelKli Detached immutable panel model containing `id` and method descriptors.
 * @param {{open?: boolean}} [optionsKli={}] Optional initial-open policy; no future state is owned by this function.
 * @returns {HTMLElement} Semantic local `<details>` panel containing a structured summary and method-view collection.
 * @throws {TypeError} Propagates DOM/method-view construction failures when required contracts are unavailable.
 */
export function createApiExplorerPanelView(
	documentKli,
	apiKli,
	panelKli,
	optionsKli = {}
) {
	const expertCountNetzach = countExpertMethods(panelKli.methods);
	const panelYesod = createApiExplorerElement(documentKli, "details", {
		attributes: {
			"data-api-panel": panelKli.id,
			"data-expert-count": expertCountNetzach
		},
		className: "panel"
	});
	panelYesod.open = Boolean(optionsKli.open);
	panelYesod.append(
		createPanelSummary(documentKli, panelKli, expertCountNetzach),
		createPanelMethods(documentKli, apiKli, panelKli.methods)
	);
	return panelYesod;
}

/**
 * @description Counts expert methods without allocating callback closures, preserving a simple deterministic summary metric.
 * @param {ReadonlyArray<object>} methodsOros Detached Explorer method models belonging to one panel.
 * @returns {number} Number of methods whose `expert` metadata is explicitly true.
 */
function countExpertMethods(methodsOros) {
	let expertCountNetzach = 0;
	for (const methodKli of methodsOros) {
		if (methodKli.expert) expertCountNetzach += 1;
	}
	return expertCountNetzach;
}

/**
 * @description Creates a structured panel summary whose name and counts remain separately styleable and readable without pseudo-content.
 * @param {Document} documentKli DOM document that owns the summary elements.
 * @param {object} panelKli Detached panel model.
 * @param {number} expertCountNetzach Number of expert methods in the panel.
 * @returns {HTMLElement} Dedicated summary containing name, method count, and optional expert count spans.
 */
function createPanelSummary(documentKli, panelKli, expertCountNetzach) {
	const summaryKli = createApiExplorerElement(documentKli, "summary", {
		className: "panel-summary"
	});
	summaryKli.append(
		createApiExplorerElement(documentKli, "span", {
			className: "panel-name",
			text: panelKli.id
		}),
		createApiExplorerElement(documentKli, "span", {
			className: "panel-count",
			text: `${panelKli.methods.length} methods`
		})
	);
	if (expertCountNetzach > 0) {
		summaryKli.append(createApiExplorerElement(documentKli, "span", {
			className: "panel-expert-count",
			text: `${expertCountNetzach} expert`
		}));
	}
	return summaryKli;
}

/**
 * @description Creates the method collection for one panel while preserving model order and one method view per registry definition.
 * @param {Document} documentKli DOM document that owns the method collection.
 * @param {object} apiKli Universal API instance shared by method sessions.
 * @param {ReadonlyArray<object>} methodsOros Detached Explorer method models in stable display order.
 * @returns {HTMLElement} Local method-container element populated with semantic method disclosures.
 */
function createPanelMethods(documentKli, apiKli, methodsOros) {
	const methodsKli = createApiExplorerElement(documentKli, "div", {
		className: "panel-methods"
	});
	for (const methodKli of methodsOros) {
		methodsKli.append(createApiExplorerMethodView(documentKli, apiKli, methodKli));
	}
	return methodsKli;
}
