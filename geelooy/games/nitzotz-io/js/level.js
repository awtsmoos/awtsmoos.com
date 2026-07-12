// B"H
import { dailySeed } from './modes/daily.js';
import { LEVELS, levelAt } from './levels/catalog.js';
import { buildArena } from './levels/generator.js';

export const WORLDS = LEVELS.map(level => [level.name, level.hue, level.targetMass, 1]);

/** Create one complete metropolis; Daily mode changes its seed, never its persistence. */
export function createLevel(save, worldIndex = 0) {
	const config = levelAt(worldIndex);
	const index = LEVELS.indexOf(config);
	const seed = save.selectedMode === 'daily' ? dailySeed(config.seed) : config.seed;
	const level = {
		...config,
		seed,
		index,
		worldIndex: index,
		baseTargetMass: config.targetMass,
		target: config.targetMass,
		clock: 1,
		objective: `Reach ${config.targetMass} mass before time expires`,
		objects: []
	};
	level.objects = buildArena(level, save.perf);
	level.totalObjects = level.objects.length;
	level.engine = 'AwtsmoosProcedural-CompositeMetropolis-3.0';
	return level;
}

export function updateLevelStream(level) {
	return level.objects;
}
