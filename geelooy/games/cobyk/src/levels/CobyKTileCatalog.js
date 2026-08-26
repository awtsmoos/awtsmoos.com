//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKTileCatalog.js
 * @description Defines the original CobyK ASCII language as immutable data so gameplay, renderer, editor, and tests share one semantic source.
 * The Awtsmoos renews symbol and meaning before a character can claim to contain the world;
 * Awtsmoos.com lets this Bina catalog bind finite letters to lawful behavior while future systems remain cleanly unfurled.
 */
const binaTutorials = Object.freeze({
	"1": "Use the Arrow Keys to Move",
	"2": "Don't touch the gray blocks",
	"3": "Pink blocks are elevators",
	"4": "Purple blocks fade away, when on top of them",
	"5": "Get all the coins to complete the level",
	"6": "Once you have all the coins, the yellow",
	"7": "block will turn green. Touch it to win!",
	"8": "Blocks with arrows on them",
	"9": "boost you in a certain direction."
});

const yesodTileDefinitions = Object.freeze({
	" ": Object.freeze({ kind: "empty" }),
	"*": Object.freeze({ kind: "brick", solid: true }),
	s: Object.freeze({ kind: "spike", hazard: true }),
	f: Object.freeze({ kind: "finisher" }),
	c: Object.freeze({ kind: "coin", collectible: true }),
	u: Object.freeze({ kind: "elevator", solid: true, kinetic: true }),
	d: Object.freeze({ kind: "shrinker", solid: true, kinetic: true }),
	l: Object.freeze({ kind: "movingSpike", hazard: true, kinetic: true }),
	"^": Object.freeze({ kind: "force", force: Object.freeze([0, 1]) }),
	">": Object.freeze({ kind: "force", force: Object.freeze([1, 0]) }),
	"<": Object.freeze({ kind: "force", force: Object.freeze([-1, 0]) }),
	p: Object.freeze({ kind: "spawn" })
});

/**
 * Reveals one canonical tile definition, synthesizing tutorial anchors from the original numbered-message table.
 * @param {string} malchusSymbol Single ASCII map symbol.
 * @returns {object|null} Immutable tile definition or null for unknown input.
 */
export function tileDefinitionFor(malchusSymbol) {
	if (yesodTileDefinitions[malchusSymbol]) {
		return yesodTileDefinitions[malchusSymbol];
	}
	if (binaTutorials[malchusSymbol]) {
		return Object.freeze({
			kind: "tutorial",
			message: binaTutorials[malchusSymbol]
		});
	}
	return null;
}

/**
 * Reports whether a symbol belongs to the preserved CobyK language.
 * @param {string} malchusSymbol Candidate map character.
 * @returns {boolean} True for every canonical gameplay/tutorial/empty symbol.
 */
export function isKnownCobyKSymbol(malchusSymbol) {
	return tileDefinitionFor(malchusSymbol) !== null;
}

export const COBYK_TUTORIALS = binaTutorials;
