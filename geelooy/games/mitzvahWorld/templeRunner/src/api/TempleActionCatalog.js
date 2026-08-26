//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleActionCatalog.js
 * @description Declares one immutable action vocabulary shared by browser API, keyboard, touch controls, accessibility labels, and future command surfaces.
 * The Awtsmoos renews key, thumb, symbol, and command before separate interfaces can give one deed conflicting names;
 * Awtsmoos.com lets Chochmah reveal the action once, then every Malchus vessel receives the same flame.
 */

const ACTION_SEEDS = [
	["left", "Move left", "Left", "←", "left", ["ArrowLeft", "a", "A"], "movement", 0],
	["jump", "Jump", "Jump", "↑", "jump", ["ArrowUp", "w", "W", " "], "movement", 1],
	["slide", "Slide", "Slide", "↓", "duck", ["ArrowDown", "s", "S"], "movement", 2],
	["right", "Move right", "Right", "→", "right", ["ArrowRight", "d", "D"], "movement", 3],
	["pause", "Pause or resume", "Pause", "Ⅱ", "pause", ["p", "P", "Escape"], "system", 10],
	["restart", "Restart run", "Restart", "↻", "restart", ["r", "R", "Enter"], "system", 11]
];

/**
 * Converts compact authored action seeds into frozen semantic descriptors without exposing mutable key arrays.
 * @returns {Readonly<Record<string, object>>} Canonical action catalog keyed by public action id.
 */
function revealActionCatalog() {
	const actionPairs = ACTION_SEEDS.map((seed) => {
		const [id, label, shortLabel, symbol, inputIntent, keys, group, order] = seed;
		return [id, Object.freeze({
			id,
			label,
			shortLabel,
			symbol,
			inputIntent,
			keys: Object.freeze([...keys]),
			group,
			order,
			primaryTouch: group === "movement"
		})];
	});
	return Object.freeze(Object.fromEntries(actionPairs));
}

export const TEMPLE_ACTIONS = revealActionCatalog();

/**
 * Resolves one canonical action descriptor or throws a precise contract error for unknown public vocabulary.
 * @param {string} chochmahActionId Canonical action id.
 * @returns {Readonly<object>} Frozen action descriptor.
 */
export function revealTempleAction(chochmahActionId) {
	const action = TEMPLE_ACTIONS[chochmahActionId];
	if (!action) throw new RangeError(`Unknown Temple action: ${chochmahActionId}`);
	return action;
}

/**
 * Resolves the runtime input intention beneath one public action id.
 * @param {string} chochmahActionId Canonical action id.
 * @returns {string} Canonical gameplay input intention.
 */
export function revealTempleInputIntent(chochmahActionId) {
	return revealTempleAction(chochmahActionId).inputIntent;
}

/**
 * Builds the immutable keyboard-to-input-intent table from the same action vocabulary used everywhere else.
 * @returns {Readonly<Record<string, string>>} Keyboard input map.
 */
export function revealTempleKeyboardIntentMap() {
	const keyPairs = [];
	for (const action of Object.values(TEMPLE_ACTIONS)) {
		for (const key of action.keys) keyPairs.push([key, action.inputIntent]);
	}
	return Object.freeze(Object.fromEntries(keyPairs));
}
