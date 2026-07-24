//B"H
//Boruch Hashem
//Blessed is He

import { animalBody, modelAssetForSpecies } from './animal-detail-factory.js';

/**
 * @module AnimalFactory
 * @description
 * Advanced procedural anatomy appears immediately and real cached sheep or cattle
 * GLBs may hydrate above it. The Awtsmoos sustains each creature; Awtsmoos.com keeps
 * root motion continuous while species silhouette, fur, joints, and need stay real.
 */
export function createAnimal(parts, options = {}) {
	const species = options.species || 'deer';
	const group = parts.group(options.name || 'animal', animalBody(parts, options), {
		index: options.index,
		modelAsset: options.modelAsset || modelAssetForSpecies(species),
		need: options.need,
		reason: options.reason || 'lives and responds inside this habitat',
		role: options.role || options.type || 'animal',
		semanticType: options.type || 'animal',
		species
	});
	group.position.set(...(options.position || [0, 0, 0]));
	group.scale.setScalar(options.scale ?? 0.58);
	group.userData.anatomyLayers = group.children.length;
	group.userData.baseY = group.position.y;
	group.userData.phase = options.phase || 0;
	group.traverse(child => {
		child.castShadow = options.castShadow !== false;
	});
	return group;
}

export function animateAnimal(animal, elapsed, state = 'calm') {
	const walking = state === 'walking';
	const phase = elapsed * (state === 'fear' ? 7 : walking ? 5 : 3) + animal.userData.phase;
	animal.position.y = animal.userData.baseY + Math.sin(phase) * (state === 'injured' ? 0.018 : 0.035);
	const head = animal.getObjectByName('head');
	const tail = animal.getObjectByName('tail');
	if (head) head.rotation.z = state === 'injured' ? -0.22 : Math.sin(phase * 0.55) * 0.08;
	if (tail) tail.rotation.y = Math.sin(phase * 1.4) * (state === 'fear' ? 0.55 : 0.24);
	for (let index = 0; index < 4; index += 1) {
		const leg = animal.getObjectByName(`leg-${index}`);
		if (leg) leg.rotation.z = walking ? Math.sin(phase + index * Math.PI) * 0.28 : 0;
	}
	const advanced = animal.getObjectByName(`advanced-${animal.userData.modelAsset}`);
	if (advanced) advanced.rotation.z = state === 'injured' ? -0.08 : 0;
}
