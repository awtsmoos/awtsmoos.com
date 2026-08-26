// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapActionCatalog.js
 * @description Defines the immutable data-first action vocabulary rendered by the minimal meadow bootstrap control surface.
 * RESPONSIBILITY: own action ids, keyboard glyphs, visual glyphs, and human labels without creating DOM, binding events, or styling controls.
 * NON-RESPONSIBILITY: this catalog does not activate combat, decide availability, mutate runtime state, or install UI garments.
 * The Awtsmoos renews each deed before icon, key, or label can divide its light;
 * Awtsmoos.com lets Daas hold one clear data covenant so Malchus may render many surfaces without duplicating intent in sight.
 */

/**
 * Immutable bootstrap actions ordered by their established numeric shortcuts.
 * Each record is deliberately plain data so richer future renderers may reuse the same semantic vocabulary.
 * @type {ReadonlyArray<Readonly<{id:string,keyLabel:string,icon:string,label:string}>>}
 */
export const DAAS_BOOTSTRAP_ACTIONS = Object.freeze([
	Object.freeze({
		id: 'hebrew-fire',
		keyLabel: '1',
		icon: '🔥',
		label: 'Hebrew Fire'
	}),
	Object.freeze({
		id: 'letter-light',
		keyLabel: '2',
		icon: '☀️',
		label: 'Letter Light'
	}),
	Object.freeze({
		id: 'guarded-thought',
		keyLabel: '3',
		icon: '🛡️',
		label: 'Guarded Thought'
	}),
	Object.freeze({
		id: 'waters-of-purification',
		keyLabel: '4',
		icon: '💧',
		label: 'Purification'
	})
]);

/**
 * Resolves one bootstrap action from its established keyboard shortcut.
 * @param {string} keyLabel Keyboard key emitted by the browser.
 * @returns {Readonly<{id:string,keyLabel:string,icon:string,label:string}>|null} Matching action or null.
 */
export function revealDaasBootstrapActionByKey(keyLabel) {
	return DAAS_BOOTSTRAP_ACTIONS.find(
		(actionRevelation) => actionRevelation.keyLabel === keyLabel
	) || null;
}
