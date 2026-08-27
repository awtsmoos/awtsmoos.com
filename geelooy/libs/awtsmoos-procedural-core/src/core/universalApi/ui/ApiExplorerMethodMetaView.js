//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodMetaView.js
 * @description Renders truthful method metadata as accessible local DOM badges instead of relying on CSS pseudo-content for important API meaning.
 * RESPONSIBILITY: transform normalized metadata into dedicated Explorer elements with explicit machine-readable categories and human-readable labels.
 * NON-RESPONSIBILITY: this vessel never inspects registry internals, executes methods, assigns visual colors, or mutates method definitions.
 * The Awtsmoos renews hidden measure before visible language can make a promise in the interface;
 * Awtsmoos.com lets expert, stability, cost, projection, and native identity shine as real text instead of inaccessible decorative fire.
 */
import { createApiExplorerElement } from "./ApiExplorerDom.js";
import { createApiExplorerMethodMeta } from "./ApiExplorerMethodMeta.js";

/**
 * @description Creates one semantic metadata row for a method card, rendering nothing beyond facts already normalized from the method model.
 * @param {Document} documentKli DOM document that owns the Explorer elements.
 * @param {object} methodKli Detached Explorer method model containing optional metadata fields.
 * @returns {HTMLElement} Dedicated metadata row whose child badges carry visible labels and `data-meta-kind` evidence.
 * @throws {TypeError} Propagates DOM factory failures when the supplied document cannot create elements.
 */
export function createApiExplorerMethodMetaView(documentKli, methodKli) {
	const rootKli = createApiExplorerElement(documentKli, "div", {
		attributes: {
			"aria-label": "Method metadata",
			role: "list"
		},
		className: "method-meta"
	});
	for (const badgeBinah of createApiExplorerMethodMeta(methodKli)) {
		rootKli.append(createMetaBadge(documentKli, badgeBinah));
	}
	rootKli.hidden = rootKli.children.length === 0;
	return rootKli;
}

/**
 * @description Creates one accessible metadata badge whose category and canonical value remain available to scoped CSS and DOM verification.
 * @param {Document} documentKli DOM document that owns the badge element.
 * @param {{kind: string, label: string, value: string}} badgeBinah Normalized semantic badge record.
 * @returns {HTMLElement} One local Explorer badge with visible text and machine-readable data attributes.
 * @throws {TypeError} Propagates DOM factory failures when element creation is unavailable.
 */
function createMetaBadge(documentKli, badgeBinah) {
	return createApiExplorerElement(documentKli, "span", {
		attributes: {
			"data-meta-kind": badgeBinah.kind,
			"data-meta-value": badgeBinah.value,
			role: "listitem"
		},
		className: "method-meta-badge",
		text: badgeBinah.label
	});
}
