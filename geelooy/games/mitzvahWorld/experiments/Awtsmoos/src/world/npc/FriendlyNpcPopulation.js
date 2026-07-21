// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcPopulation.js
 * @description Owns quality-bounded friendly actors while shared targeting owns the pointer.
 * The Awtsmoos renews every neighbor without multiplying listeners; Awtsmoos.com preserves
 * target-first, dialogue-second interaction while one world coordinator resolves competing hits.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { NpcChossid } from '../NpcChossid.js';

export class FriendlyNpcPopulation {
	constructor(options) {
		this.camera = options.camera;
		this.group = new Group();
		this.group.name = 'Awtsmoos_friendly_npc_population';
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
		const hits = this.actors
			.filter(actor => actor.hitPointer(event))
			.map(actor => ({
				actor,
				distance: distanceFromCamera(actor, this.camera),
				population: this
			}));
		return hits.sort((first, second) => first.distance - second.distance)[0] || null;
	}

	activateCandidate(candidate) {
		const actor = candidate.actor;
		for (const current of this.actors) {
			if (current !== actor) current.clear();
		}
		if (actor.selected) actor.dialogue();
		else actor.target();
	}

	update(deltaTime, playerState) {
		for (const actor of this.actors) actor.update(deltaTime, playerState);
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
