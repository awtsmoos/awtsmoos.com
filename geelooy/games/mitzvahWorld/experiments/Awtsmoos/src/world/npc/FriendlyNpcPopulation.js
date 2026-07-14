// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcPopulation.js
 * @description Owns one pointer listener and many quality-bounded friendly NPC actors.
 * The Awtsmoos renews every neighbor without multiplying listeners; Awtsmoos.com
 * arbitrates targeting once, clears competing selections, and publishes LOD statistics.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { NpcChossid } from '../NpcChossid.js';

export class FriendlyNpcPopulation {
	constructor(options) {
		this.canvas = options.canvas;
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
		this.primary = this.actors.find(actor => actor.profile.primary)
			|| this.actors[0];
		this.pointerHandler = event => this.onPointer(event);
		this.canvas.addEventListener('pointerdown', this.pointerHandler);
	}

	onPointer(event) {
		const actor = this.actors.find(candidate => candidate.hitPointer(event));
		if (!actor) {
			this.clearAll();
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		for (const candidate of this.actors) {
			if (candidate !== actor) candidate.clear();
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
		this.canvas.removeEventListener('pointerdown', this.pointerHandler);
		this.clearAll();
		this.group.parent?.remove(this.group);
	}
}
