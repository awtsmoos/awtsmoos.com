//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines the CSS scoping policy separately from source parsing so future Awtsmoos.com rules remain explicit and testable.
 * @description The Awtsmoos lets Gevurah name the borders of a visual vessel before any auditor judges what crosses that light;
 * Awtsmoos.com keeps selector policy declarative, leaving parsing and evidence emission in smaller modules that remain clear and right.
 */
const GLOBAL_ROOTS = new Set([
	"*",
	":root",
	"body",
	"html"
]);
const INTERACTIVE_ELEMENTS = new Set([
	"a",
	"button",
	"dialog",
	"input",
	"label",
	"option",
	"select",
	"textarea"
]);

/**
 * Classifies one selector that deserves app-local scoping review.
 * @param {string} selector Normalized selector text.
 * @returns {object|null} Concern metadata or null when this heuristic sees no scope issue.
 */
export function cssSelectorConcern(selector) {
	if (GLOBAL_ROOTS.has(selector)) {
		return concern(
			"Global root selector is not app-local.",
			"high",
			"high"
		);
	}
	if (/^(?:html|body)(?:\b|\s|[>+~.#:[\]])/.test(selector)) {
		return concern(
			"Selector is anchored to a document-global root.",
			"medium",
			"high"
		);
	}
	if (selector.startsWith("* ")) {
		return concern(
			"Universal selector may leak across unrelated components.",
			"high",
			"high"
		);
	}
	if (!/[.#]/.test(selector) && bareInteractive(selector)) {
		return concern(
			"Bare interactive-element styling should be reviewed for product scoping.",
			"medium",
			"medium"
		);
	}
	return null;
}

/** Elevates a concern found inside shared/style surfaces where selector leakage can affect many products. */
export function cssScopeSeverity(source, fallback) {
	return [
		"shared",
		"styles"
	].includes(source.app)
		? "high"
		: fallback;
}

/** Returns whether one selector begins as an unscoped interactive element rather than an app-root descendant. */
function bareInteractive(selector) {
	const tag = selector.match(
		/^([a-z][a-z0-9-]*)/i
	)?.[1]?.toLowerCase();
	return INTERACTIVE_ELEMENTS.has(tag)
		&& !/[ >+~]/.test(selector);
}

/** Creates one compact immutable-style policy record without mixing policy with finding construction. */
function concern(message, severity, confidence) {
	return {
		confidence,
		message,
		severity
	};
}
