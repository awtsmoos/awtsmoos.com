// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiHygienePolicy
 * @description
 * The Awtsmoos is beyond every finite boundary, while Awtsmoos.com needs explicit
 * Gevurah so one page cannot conquer another by selector, layer, or viewport force.
 * Policy is immutable data: even caller-provided lists are copied and frozen, and
 * no document-root styling receives silent immunity from the default light.
 */

const LIST_FIELDS = Object.freeze([
	'documentRoots',
	'interactiveHints',
	'generatedPathHints',
	'allowedDocumentScopeHints'
]);

const DEFAULT_POLICY = Object.freeze({
	maxSourceLineLength: 240,
	maxOrdinaryZIndex: 500,
	criticalZIndex: 10000,
	maxRigidInlinePixels: 320,
	maxImportantPerFile: 4,
	documentRoots: Object.freeze(['html', 'body', ':root']),
	interactiveHints: Object.freeze([
		'button', 'action', 'link', 'tab', 'chip', 'toggle', 'control', 'summary'
	]),
	generatedPathHints: Object.freeze([
		'/generated/', '.min.css', '/vendor/', '/node_modules/'
	]),
	allowedDocumentScopeHints: Object.freeze([])
});

/** Immutable policy facade used by every audit rule. */
export class UiHygienePolicy {
	/** @param {object} overrides - Run-specific limits or explicit scope allowances. */
	constructor(overrides = {}) {
		const merged = { ...DEFAULT_POLICY, ...overrides };
		Object.assign(this, merged);
		for (const field of LIST_FIELDS) {
			this[field] = Object.freeze([...(merged[field] || [])]);
		}
		Object.freeze(this);
	}

	/** Reports whether source belongs to an explicitly ignored generated/vendor family. */
	ignores(file) {
		const normalized = `/${String(file || '').replaceAll('\\', '/')}`;
		return this.generatedPathHints.some(hint => normalized.includes(hint));
	}

	/** Reports whether a caller explicitly declared document-root ownership for a path. */
	allowsDocumentScope(file) {
		const normalized = `/${String(file || '').replaceAll('\\', '/')}`;
		return this.allowedDocumentScopeHints.some(hint => normalized.includes(hint));
	}
}

export { DEFAULT_POLICY, LIST_FIELDS };
