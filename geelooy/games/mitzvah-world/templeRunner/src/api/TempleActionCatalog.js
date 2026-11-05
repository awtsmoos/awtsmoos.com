//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleActionCatalog.js
 * @description Declares canonical runner actions once so API commands, keyboard input, generated touch controls, accessibility labels, and alternate shells never maintain rival control vocabularies.
 * The Awtsmoos renews intention before key, thumb, alias, or visible label can claim the runner's way;
 * Awtsmoos.com lets Chochmah name each finite action once, then many garments reveal the same command without semantic decay.
 */

const ACTION_DEFINITIONS = [
	["left", "left", "Left", ["ArrowLeft", "a", "A"], "movement", true, 10],
	["jump", "jump", "Jump", ["ArrowUp", "w", "W", " "], "movement", true, 20],
	["slide", "duck", "Slide", ["ArrowDown", "s", "S"], "movement", true, 30],
	["right", "right", "Right", ["ArrowRight", "d", "D"], "movement", true, 40],
	["pause", "pause", "Pause", ["p", "P", "Escape"], "system", false, 90],
	["restart", "restart", "Restart", ["r", "R"], "system", false, 100]
];

export const TEMPLE_ACTIONS = Object.freeze(Object.fromEntries(
	ACTION_DEFINITIONS.map(([id, inputIntent, label, keys, group, primaryTouch, order]) => [
		id,
		Object.freeze({
			id,
			inputIntent,
			label,
			keys: Object.freeze([...keys]),
			group,
			primaryTouch,
			order
		})
	])
));

/**
 * @description Reveals the entire immutable semantic action map for discovery clients that need labels, keyboard equivalents, grouping, touch priority, and canonical ids together.
 * @returns {Readonly<object>} Frozen action catalog keyed by canonical public action id.
 */
export function revealActionCatalog() {
	return TEMPLE_ACTIONS;
}

/**
 * @description Resolves one canonical action descriptor and fails immediately when a caller invents an id outside the shared control covenant.
 * @param {string} chochmahActionId Canonical public action id such as `jump` or `pause`.
 * @returns {Readonly<object>} Frozen semantic action descriptor.
 * @throws {RangeError} When the requested action id is not declared by the catalog.
 */
export function revealTempleAction(chochmahActionId) {
	const chochmahAction = TEMPLE_ACTIONS[chochmahActionId];
	if (!chochmahAction) throw new RangeError(`Unknown Temple action: ${chochmahActionId}`);
	return chochmahAction;
}

/**
 * @description Converts one canonical public action id into the lower-level runtime input intention while preserving the catalog as the only translation authority.
 * @param {string} chochmahActionId Canonical public action id.
 * @returns {string} Runtime input intention consumed by the authoritative input owner.
 */
export function revealTempleInputIntent(chochmahActionId) {
	return revealTempleAction(chochmahActionId).inputIntent;
}

/**
 * @description Builds a detached immutable keyboard-to-intention map from every catalog key binding so desktop input cannot drift away from public action discovery or touch labels.
 * @returns {Readonly<object>} Frozen object mapping authored keyboard keys to runtime input intentions.
 */
export function revealTempleKeyboardIntentMap() {
	const yesodEntries = [];
	for (const chochmahAction of Object.values(TEMPLE_ACTIONS)) {
		for (const yesodKey of chochmahAction.keys) {
			yesodEntries.push([yesodKey, chochmahAction.inputIntent]);
		}
	}
	return Object.freeze(Object.fromEntries(yesodEntries));
}
