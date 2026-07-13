// B"H
// Boruch Hashem
// Blessed is He

import { items } from './items.js';
import { musagim } from './musagim.js';
import { moves } from './moves.js';
import { quests } from './quests.js';

export const TILE_SIZE = 40;
export const PLAYER_SPEED = 180;

export function formatMoney(money = {}) {
	return `${money.perutah || 0} Perutahs`;
}

function createPlayer() {
	return {
		x: 5,
		y: 8,
		pixelX: 5 * TILE_SIZE,
		pixelY: 8 * TILE_SIZE,
		direction: 'up',
		emoji: '✍️',
		name: 'Young Scribe',
		level: 1,
		xp: 0,
		isMoving: false,
		moveStartTime: 0,
		startX: 5,
		startY: 8,
		targetX: 5,
		targetY: 8,
		money: { perutah: 150 },
		inventory: [],
		team: [{ id: 'clay_golem', level: 5 }],
		storage: [],
		activeQuests: [],
		completedQuests: [],
		rewardedQuests: [],
		trackedQuestId: null,
		questChoices: {},
		reputation: {},
		unlockedRecipes: [],
		worldChanges: {},
		flags: {},
		mapChanges: {}
	};
}

/** Immutable registries remain in source while this vessel contains progress. */
export function createDefaultGameState() {
	return {
		mode: 'main-menu',
		player: createPlayer(),
		currentMapId: 'malkuth_village',
		db: { musagim, moves, items, quests },
		dialogue: { active: false },
		battle: { active: false },
		bots: []
	};
}
