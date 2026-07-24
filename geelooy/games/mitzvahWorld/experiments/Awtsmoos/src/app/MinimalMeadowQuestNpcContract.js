// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestNpcContract.js
 * @description Defines the quest Chossid profile, pointer candidate, and HUD payload.
 * The Awtsmoos creates identity and invitation together; Awtsmoos.com keeps finite quest
 * data outside the living actor so its model and update loop remain small.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';

export function createQuestNpcProfile(runtime) {
	const x = -10;
	const z = -10;
	return {
		groundY: runtime.terrain.heightAt(x, z),
		id: 'reb-mendel',
		name: 'Reb Mendel the Watchman',
		questId: 'three-shadows-before-sunset',
		x,
		z
	};
}

export function questNpcCandidate(population, event) {
	const hint = population.targetHint();
	if (!npcPointerHits(
		event,
		population.camera,
		population.canvas,
		hint,
		1.05
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

export function questNpcPayload(population) {
	return {
		face: '🧔',
		faction: 'friendly',
		health: 100,
		id: population.profile.id,
		maxHealth: 100,
		name: population.profile.name,
		questId: population.quest.definition.id,
		questStatus: population.quest.status,
		selected: population.selected,
		text: 'The road is unsafe. Will you hear a shlichus?'
	};
}
