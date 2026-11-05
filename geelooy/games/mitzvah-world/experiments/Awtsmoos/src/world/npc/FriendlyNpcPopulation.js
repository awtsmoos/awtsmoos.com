// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcPopulation.js
 * @description Owns friendly actors, shared time, first-click study, and second-click discussion.
 * The Awtsmoos renews every neighbor beneath one sun; Awtsmoos.com lets first sight reveal the
 * Chossid and second sight open his words, mission, question, or peaceful dispute without confusion.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { NpcChossid } from '../NpcChossid.js';
import { FriendlyNpcWorldClock } from './FriendlyNpcWorldClock.js';

export class FriendlyNpcPopulation {
	constructor(options) {
		this.camera = options.camera;
		this.group = new Group();
		this.group.name = 'Awtsmoos_friendly_npc_population';
		this.worldClock = options.worldClock || new FriendlyNpcWorldClock({
			dayLengthSeconds: options.dayLengthSeconds,
			initialHour: options.initialWorldHour
		});
		this.actors = options.profiles.map((profile, index) => {
			const actor = new NpcChossid({
				bus: options.bus,
				camera: options.camera,
				canvas: options.canvas,
				gltf: options.gltfs[index],
				ground: options.ground,
				profile
			});
			this.group.add(actor.group);
			return actor;
		});
		this.primary = this.actors.find(actor => actor.profile.primary) || this.actors[0];
	}

	candidateFromPointer(event) {
		let nearest = null;
		for (const actor of this.actors) {
			if (!actor.hitPointer(event)) continue;
			const distance = distanceFromCamera(actor, this.camera);
			if (!nearest || distance < nearest.distance) {
				nearest = { actor, distance, population: this };
			}
		}
		return nearest;
	}

	selectCandidate(candidate) {
		const actor = candidate?.actor || candidate;
		if (!actor) return false;
		for (const current of this.actors) {
			if (current !== actor) current.clear();
		}
		return actor.target();
	}

	interactCandidate(candidate) {
		const actor = candidate?.actor || candidate;
		if (!actor) return false;
		if (!actor.selected) this.selectCandidate(actor);
		return actor.dialogue();
	}

	candidateSelected(candidate) {
		return Boolean(candidate?.actor?.selected || candidate?.selected);
	}

	activateCandidate(candidate) {
		return this.candidateSelected(candidate)
			? this.interactCandidate(candidate)
			: this.selectCandidate(candidate);
	}

	update(deltaTime, playerState) {
		const worldHour = this.worldClock.update(deltaTime, playerState);
		for (const actor of this.actors) {
			actor.update(deltaTime, playerState, worldHour);
		}
	}

	clearAll() {
		for (const actor of this.actors) actor.clear();
	}

	stats() {
		const byLod = {};
		for (const actor of this.actors) {
			byLod[actor.lod.id] = (byLod[actor.lod.id] || 0) + 1;
		}
		return {
			actors: this.actors.length,
			byLod,
			clock: this.worldClock.stats(),
			selected: this.actors.find(actor => actor.selected)?.profile.id || null
		};
	}

	destroy() {
		this.clearAll();
		this.group.parent?.remove(this.group);
	}
}

function distanceFromCamera(actor, camera) {
	const hint = actor.targetHint();
	const position = camera?.position || { x: 0, y: 0, z: 0 };
	return Math.hypot(hint.x - position.x, hint.y - position.y, hint.z - position.z);
}
