/**
 * B"H
 * @module RuntimeDefaults
 * @description Transient dialogue, battle, and developer runtime vessels.
 */
export const createDialogue = () => ({
	open: false,
	glyph: null,
	label: '',
	lines: [],
	index: 0,
	questId: null,
	mode: 'intro',
	choices: []
});

export const createDebate = () => ({
	enemy: null,
	enemyLight: 0,
	enemyMaxLight: 0,
	cursor: 0,
	choice: null,
	lastMove: null,
	rank: null,
	status: { player: {}, enemy: {} },
	turn: 0,
	fxShake: 0,
	phase: 'choice',
	phaseTTL: 0,
	pendingPlayer: null,
	pendingEnemy: null,
	pendingReward: null,
	rewardText: '',
	banner: '',
	outcome: null,
	log: ['No debate is active.'],
	moves: []
});

export const createTestState = () => ({
	visible: true,
	lastAction: 'Ready',
	presets: {
		gifts: { map: 'Rambam_Garden', start: { x: 2, y: 5 }, target: { x: 2, y: 2 } },
		declaration: { map: 'House_Of_Forgetting', start: { x: 2, y: 6 }, target: { x: 13, y: 6 } }
	}
});
