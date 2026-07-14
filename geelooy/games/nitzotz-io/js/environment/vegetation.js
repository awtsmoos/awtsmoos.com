// B"H
// Boruch Hashem
// Blessed is He
import { treeMaterial } from '../materials/objectMaterials.js';
import { heightAt } from '../math.js';
import { modelVariantKey } from '../modelKey.js';
import { cmd } from '../renderList/command.js';
import { chapterVegetationPlants } from './botany/palettes.js';

const MODEL_HEIGHTS = Object.freeze({
	cypressTree: 4.875,
	broadleafTree: 4.824,
	willowTree: 3.985,
	pineTree: 4.852,
	floweringTree: 4.32,
	oliveTree: 3.591
});

/**
 * The Awtsmoos reveals chapter-aware species through real procedural silhouettes.
 * Brown trunks, green foliage, and flowers now receive their proper masked garments.
 */
export function vegetationCommands(commands, world, _preset, budget) {
	const plants = chapterVegetationPlants(world.level);
	const count = Math.max(0, Math.floor(Number(budget.vegetation) || 0));
	if (!plants.length || count === 0) return 0;
	const seed = Number(world.level.seed) || 1;
	for (let index = 0; index < count; index += 1) {
		const descriptor = vegetationDescriptor(world.level, plants, seed, index, count);
		commands.push(cmd(
			modelVariantKey(descriptor.modelId, descriptor.variant),
			descriptor.position,
			descriptor.scale,
			descriptor.rotation,
			[1, 1, 1],
			0.94,
			0.04,
			0,
			treeMaterial(descriptor.modelId) || 'foliage'
		));
	}
	return count;
}

/** Build one deterministic tree descriptor without touching renderer state. */
export function vegetationDescriptor(level, plants, seed, index, count) {
	const variation = seededUnit(seed, index + 211);
	const paletteOffset = Math.floor(seededUnit(seed, index + 79) * plants.length);
	const paletteIndex = (index + paletteOffset) % plants.length;
	const plant = plants[paletteIndex];
	const angle = index / Math.max(1, count) * Math.PI * 2 + variation * 0.38;
	const band = index % 3;
	const radius = level.bounds * (0.84 + band * 0.055 + variation * 0.028);
	const x = Math.cos(angle) * radius;
	const z = Math.sin(angle) * radius;
	const targetHeight = level.bounds * (0.032 + variation * 0.016);
	const modelHeight = MODEL_HEIGHTS[plant.modelId] || 4.5;
	const uniformScale = targetHeight / modelHeight;
	return Object.freeze({
		plantId: plant.id,
		modelId: plant.modelId,
		variant: Math.floor(seededUnit(seed, index + 401) * 4),
		position: Object.freeze([x, heightAt(x, z, level.index) - 1.5, z]),
		scale: Object.freeze([uniformScale, uniformScale, uniformScale]),
		rotation: -angle + seededUnit(seed, index + 613) * 0.5
	});
}

function seededUnit(seed, index) {
	let value = (seed + Math.imul(index + 5, 0x85ebca6b)) >>> 0;
	value = (value ^ (value >>> 13)) >>> 0;
	value = Math.imul(value, 0xc2b2ae35) >>> 0;
	value = (value ^ (value >>> 16)) >>> 0;
	return value / 4294967296;
}
