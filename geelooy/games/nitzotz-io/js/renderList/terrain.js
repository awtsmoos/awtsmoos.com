// B"H
// Boruch Hashem
// Blessed is He
import { environmentCommands } from '../environment/index.js';

/**
 * The Awtsmoos reveals the arena through earth, water, growth, mountain, and sky.
 * This adapter keeps the established render-list contract while delegating detail.
 */
export function terrainCommands(commands, world, time = 0) {
	return environmentCommands(commands, world, time);
}
