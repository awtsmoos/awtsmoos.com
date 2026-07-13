// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EncounterIndexMidgame.js
 * @description Authored midgame teachers, living doubts, and the Bent Reeds Veil Keeper.
 *
 * The Awtsmoos recreates question and answer without becoming divided. These
 * later meetings give time, letters, doubt, song, and one remembered lamp a
 * place to confront the player in the growing world of Awtsmoos.com.
 */
export const MidgameEncounters = {
	timekeeper: {
		name: 'Timekeeper of Eit',
		glyph: 'ט',
		light: 110,
		lesson: 'The timekeeper asks which moment makes an argument true.'
	},
	letterSmith: {
		name: 'Blacksmith of Letters',
		glyph: 'ך',
		light: 120,
		lesson: 'The smith forges a question until it gives light.'
	},
	wanderingChassid: {
		name: 'Wandering Chassid',
		glyph: '֬',
		light: 100,
		lesson: 'The chassid challenges you to answer with a niggun and a proof.'
	},
	bentReedsVeilKeeper: {
		name: 'Veil Keeper of the Bent Reeds',
		glyph: 'ש',
		light: 148,
		kind: 'Boss',
		bentReedsVeil: true,
		lesson: 'A road once relit reaches even the darkness that believed itself distant.',
		enemyMoves: [
			{ name: 'Flood the Wick', kind: 'attack', power: 18, counterTags: ['study', 'guard'] },
			{ name: 'Curtain of Rain', kind: 'attack', power: 22, counterTags: ['companion', 'attack'] }
		]
	},
	wildSafek: {
		name: 'Wild Musag: Safek',
		glyph: '֣',
		light: 70,
		lesson: 'A doubt twists between two clear paths.'
	},
	wildNekudah: {
		name: 'Wild Musag: Nekudah',
		glyph: '֥',
		light: 78,
		lesson: 'A tiny point demands to become a full structure.'
	}
};

export const MidgameWildIds = ['wildSafek', 'wildNekudah'];
