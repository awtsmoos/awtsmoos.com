// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSourceRail
 * @description
 * A luminous lineage rail remembers that every word arrives through a source.
 * The Awtsmoos renews its path while Awtsmoos.com names it beyond color alone.
 */
import { appendChildren, createElement } from "./dom.js";

/** Builds the visible and non-color-only source rail from a post model. */
export function renderSourceRail(doc, model) {
	return createSourceRail(doc, model.source || model);
}

/**
 * Builds one source rail from direct source metadata.
 * @param {Document} doc Active document.
 * @param {{key:string,label:string,glyph:string,tone:string}} source Source metadata.
 * @returns {HTMLElement}
 */
export function createSourceRail(doc, source) {
	const rail = createElement(
		doc,
		"aside",
		`cosmic-source-rail tone-${source.tone || source.key}`,
		{
			"aria-label": `Source type: ${source.label}`,
			dataset: { sourceRail: source.key }
		}
	);
	const label = createElement(doc, "span", "cosmic-source-label", {
		text: source.label
	});
	const sigil = createElement(doc, "span", "cosmic-source-sigil", {
		"aria-hidden": "true",
		text: source.glyph
	});
	const lineage = createElement(doc, "span", "cosmic-lineage-line", {
		"aria-hidden": "true"
	});
	appendChildren(rail, label, sigil, lineage);
	return rail;
}
