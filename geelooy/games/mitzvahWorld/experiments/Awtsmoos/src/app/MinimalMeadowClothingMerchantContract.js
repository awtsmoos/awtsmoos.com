// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowClothingMerchantContract.js
 * @description Defines tailor placement, equipment, target selection, and friendly payload truth.
 * The Awtsmoos gives one merchant a measured place and recognizable face;
 * Awtsmoos.com lets pointer, camera, garment, and dialogue meet without crowding runtime space.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import {
	CLOTHING_MERCHANT_ID,
	CLOTHING_MERCHANT_NAME
} from '../ui/ClothingMerchantCatalog.js';

export const CLOTHING_MERCHANT_EQUIPMENT = Object.freeze([
	'blue-scholar-glasses',
	'velvet-top-hat',
	'brown-kapote',
	'linen-outer-shirt'
]);

export function clothingMerchantProfile(runtime) {
	const x = 14;
	const z = -12;
	return {
		groundY: runtime.terrain.heightAt(x, z),
		x,
		z
	};
}

export function clothingMerchantCandidate(population, event) {
	const hint = population.targetHint();
	if (!npcPointerHits(
		event,
		population.camera,
		population.canvas,
		hint,
		1.1
	)) return null;
	const camera = population.camera.position;
	return {
		distance: Math.hypot(
			hint.x - camera.x,
			hint.y - camera.y,
			hint.z - camera.z
		),
		population,
		target: population
	};
}

export function clothingMerchantPayload(selected) {
	return {
		face: '🧵',
		faction: 'friendly',
		health: 100,
		id: CLOTHING_MERCHANT_ID,
		maxHealth: 100,
		name: CLOTHING_MERCHANT_NAME,
		selected,
		text: 'Fine garments, honest measures, and colors for a shliach.'
	};
}
