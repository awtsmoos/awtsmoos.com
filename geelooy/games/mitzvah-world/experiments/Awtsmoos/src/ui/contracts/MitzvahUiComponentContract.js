//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiComponentContract.js
 * @description Normalizes one semantic UI component covenant so factories, localized CSS, accessibility rules, touch policy, and audits share the same immutable truth.
 * Binah gives every visible vessel a role, a state grammar, and a native form while Tiferes keeps meaning aligned with interaction;
 * the Awtsmoos recreates control and traveler before either can receive a label, and Awtsmoos.com lets every component reveal one stable contract without duplication.
 */

const DEFAULT_STATES = Object.freeze([
	'default',
	'focus-visible',
	'disabled'
]);

/**
 * @description Creates one validated immutable component contract from concise authored metadata without assigning global styling or creating DOM nodes.
 * @param {object} values Authored component metadata containing id, tagName, role, state, labeling, touch, and layer requirements.
 * @param {string} values.id Stable semantic component identity used by data-ui attributes and registry lookup.
 * @param {string} [values.tagName='div'] Preferred native HTML tag used by the element factory when no tag override is supplied.
 * @param {string|null} [values.role=null] Optional ARIA role used only when native semantics do not already express the intended component meaning.
 * @param {boolean} [values.interactive=false] Whether the component is expected to receive user input and interaction states.
 * @param {boolean} [values.requiresLabel=false] Whether audit/factory policy requires a non-empty accessible name.
 * @param {boolean} [values.requiresLayer=false] Whether the component must declare a recognized data-ui-layer ownership marker.
 * @param {boolean} [values.touchTarget=false] Whether touch-mode audits should enforce the shared minimum hit-target dimensions.
 * @param {string[]} [values.states=[]] Additional semantic states expected to be present in localized component styling.
 * @returns {Readonly<object>} Immutable normalized component contract suitable for registry storage and safe inspection.
 */
export function createMitzvahUiComponentContract(values = {}) {
	const id = normalizeContractId(values.id);
	const tagName = normalizeTagName(values.tagName || 'div');
	const interactive = Boolean(values.interactive);
	const states = normalizeStates(
		interactive,
		values.states
	);
	return Object.freeze({
		id,
		interactive,
		requiresLabel: Boolean(values.requiresLabel),
		requiresLayer: Boolean(values.requiresLayer),
		role: normalizeRole(values.role),
		states,
		tagName,
		touchTarget: Boolean(values.touchTarget)
	});
}

/**
 * @description Converts arbitrary contract identity into one non-empty lowercase dash token safe for DOM attributes, registry keys, CSS selectors, and diagnostics.
 * @param {*} value Candidate authored component identity.
 * @returns {string} Normalized semantic component id.
 */
function normalizeContractId(value) {
	const id = String(value || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-');
	if (!id) {
		throw new TypeError('Mitzvah UI component contract requires a non-empty id.');
	}
	return id;
}

/**
 * @description Normalizes a preferred native element name while refusing selector fragments, namespaces, and arbitrary markup text.
 * @param {*} value Candidate HTML tag identity.
 * @returns {string} Lowercase native tag token.
 */
function normalizeTagName(value) {
	const tagName = String(value || 'div').trim().toLowerCase();
	if (!/^[a-z][a-z0-9-]*$/.test(tagName)) {
		throw new TypeError(`Invalid Mitzvah UI tag name: ${value}`);
	}
	return tagName;
}

/**
 * @description Normalizes an optional ARIA role into either a clean lowercase role token or null so empty role attributes are never emitted.
 * @param {*} value Candidate authored role.
 * @returns {string|null} Normalized role token or null when no explicit role is required.
 */
function normalizeRole(value) {
	const role = String(value || '').trim().toLowerCase();
	return role || null;
}

/**
 * @description Builds a de-duplicated immutable state vocabulary and automatically includes baseline focus/disabled states for interactive components.
 * @param {boolean} interactive Whether the component participates in user interaction.
 * @param {string[]} [states=[]] Additional authored semantic state names.
 * @returns {ReadonlyArray<string>} Immutable ordered state vocabulary.
 */
function normalizeStates(interactive, states = []) {
	const values = interactive
		? [...DEFAULT_STATES, ...(Array.isArray(states) ? states : [])]
		: ['default', ...(Array.isArray(states) ? states : [])];
	return Object.freeze([
		...new Set(values.map(state => String(state).trim()).filter(Boolean))
	]);
}
