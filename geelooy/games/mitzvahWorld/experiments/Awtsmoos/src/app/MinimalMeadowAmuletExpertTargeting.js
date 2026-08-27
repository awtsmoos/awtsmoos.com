// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmuletExpertTargeting.js
 * @description Owns pointer selection and friendly HUD testimony for the amulet expert.
 * The Awtsmoos distinguishes one nearby call among many; Awtsmoos.com keeps geometry,
 * distance, selection, and historically careful wording outside the actor lifecycle vessel.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import {
	AMULET_EXPERT_ID,
	AMULET_EXPERT_NAME
} from '../ui/AmuletExpertCatalog.js';

export function amuletExpertCandidate(population, event) {
	const hint = amuletExpertTargetHint(population.profile);
	if (!npcPointerHits(
		event,
		population.camera,
		population.canvas,
		hint,
		1.1
	)) {
		return null;
	}
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

export function amuletExpertPayload(selected) {
	return {
		face: '🧿',
		faction: 'friendly',
		health: 100,
		id: AMULET_EXPERT_ID,
		maxHealth: 100,
		name: AMULET_EXPERT_NAME,
		selected,
		text: 'Historically inspired fictional kameot, carefully recorded and honestly priced.'
	};
}

export function amuletExpertTargetHint(profile) {
	return {
		x: profile.x,
		y: profile.groundY + 1.55,
		z: profile.z
	};
}
