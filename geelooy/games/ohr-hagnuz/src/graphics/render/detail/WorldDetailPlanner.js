// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDetailPlanner.js
 * @description Plans deterministic visual-only props from canonical tile truth.
 *
 * The Awtsmoos gives each form its boundary. Awtsmoos.com may reveal reeds and
 * ruins, yet this planner never changes solidity, quests, entities, or rewards.
 */
import { visualSeed } from './VisualSeed.js';

export class WorldDetailPlanner {
	static plan(tile, theme) {
		if (this.isProtected(tile)) return [];
		const seed = visualSeed(tile.x, tile.y, theme.id.length);
		if (tile.char === '~' && seed % 8 === 0) {
			return [{ kind: 'REEDS', seed, theme }];
		}
		if (tile.t.startsWith('G_TREE') && seed % 4 === 0) {
			return [{ kind: 'MOSS_ROCK', seed, theme }];
		}
		if (tile.t.startsWith('G_WALL') && seed % 5 === 0) {
			return [{ kind: 'RUIN_FRAGMENT', seed, theme }];
		}
		if (this.isOpenGround(tile) && seed % Math.max(11, Math.round(17 / theme.density)) === 0) {
			return [{ kind: 'SHRUB', seed, theme }];
		}
		return [];
	}

	static isProtected(tile) {
		return tile.isPortal || tile.isSoul || tile.isEnemy || tile.encounter
			|| tile.t === 'G_DIRT_PATH';
	}

	static isOpenGround(tile) {
		return !tile.solid && ['1', '🌿', '.'].includes(tile.char);
	}
}
