// B"H
// Boruch Hashem
// Blessed is He
import { botanicalGalleryCommands } from './botany/gallery.js';
import { environmentBudget } from './budget.js';
import { groundCommands } from './ground.js';
import { mountainCommands } from './mountains.js';
import { environmentPreset } from './presets.js';
import { skyCommands } from './sky.js';
import { vegetationCommands } from './vegetation.js';
import { waterCommands } from './water.js';

/**
 * The Awtsmoos binds earth, water, growth, mountain, and sky into one measured
 * procession. The optional gallery stays inside the real arena and debug vessel.
 */
export function environmentCommands(commands, world, time = 0) {
	const preset = environmentPreset(world.level);
	const budget = environmentBudget(world, preset);
	const start = commands.length;
	groundCommands(commands, world, preset, budget);
	waterCommands(commands, world, preset, budget, time);
	vegetationCommands(commands, world, preset, budget);
	mountainCommands(commands, world, preset, budget);
	skyCommands(commands, world, preset, budget, time);
	const added = commands.length - start;
	if (added > budget.maximumCommands) {
		commands.splice(start + budget.maximumCommands, added - budget.maximumCommands);
	}
	const galleryCommands = world.botanicalGallery ? botanicalGalleryCommands(commands, world) : 0;
	return {
		preset,
		budget,
		galleryCommands,
		commands: Math.min(added, budget.maximumCommands) + galleryCommands * 2
	};
}
