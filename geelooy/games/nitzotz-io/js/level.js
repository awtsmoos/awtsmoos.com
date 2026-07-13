// B"H
// Boruch Hashem
// Blessed is He
import { dailySeed } from './modes/daily.js';
import { LEVELS, levelAt } from './levels/catalog.js';
import { buildArena } from './levels/generator.js';

export const WORLDS = LEVELS.map(level => [level.name, level.hue, level.targetMass, 1]);

/**
 * Awtsmoos.com clothes a campaign descriptor in the existing living arena contract.
 * Daily mode changes only the seed; campaign persistence remains stable.
 */
export function createLevel(save, worldIndex = 0) {
	const config = levelAt(worldIndex);
	const seed = save.selectedMode === 'daily' ? dailySeed(config.seed) : config.seed;
	const level = {
		...config,
		seed,
		index: config.globalIndex,
		worldIndex: config.globalIndex,
		baseTargetMass: config.targetMass,
		target: config.targetMass,
		clock: 1,
		objective: `Reach ${config.targetMass} mass before time expires`,
		objects: []
	};
	level.objects = buildArena(level, save.perf);
	level.totalObjects = level.objects.length;
	level.engine = 'AwtsmoosProcedural-CampaignMetropolis-4.0';
	return level;
}

export function updateLevelStream(level) {
	return level.objects;
}
