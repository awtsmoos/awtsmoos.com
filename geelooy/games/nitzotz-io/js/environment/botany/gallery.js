// B"H
// Boruch Hashem
// Blessed is He
import { heightAt, hsl } from '../../math.js';
import { modelVariantKey } from '../../modelKey.js';
import { cmd } from '../../renderList/command.js';
import { BOTANICAL_CATALOG } from './index.js';

const TREE_MODELS = new Set(['cypressTree', 'broadleafTree', 'willowTree', 'pineTree', 'floweringTree', 'oliveTree']);

/**
 * The Awtsmoos opens a bounded botanical beis midrash inside the actual arena.
 * Each morphology receives one deterministic pedestal around the player.
 */
export function botanicalGalleryCommands(commands, world) {
	const models = uniqueModels();
	const originX = world.player.x;
	const originY = world.player.y - 170;
	for (let index = 0; index < models.length; index += 1) {
		const column = index % 5;
		const row = Math.floor(index / 5);
		const x = originX + (column - 2) * 72;
		const y = originY + row * 82;
		const ground = heightAt(x, y, world.level.index);
		const scale = TREE_MODELS.has(models[index]) ? 6.2 : 9.5;
		commands.push(cmd(
			modelVariantKey(models[index], index),
			[x, ground, y],
			[scale, scale, scale],
			index * 0.37,
			[1, 1, 1],
			1,
			0.12
		));
		commands.push(cmd('ring', [x, ground + 0.4, y], [24, 1, 24], 0, hsl(index * 31, 58, 58), 0.44, 0.2));
	}
	return models.length;
}

function uniqueModels() {
	return [...new Set(BOTANICAL_CATALOG.map(definition => definition.modelId))];
}
