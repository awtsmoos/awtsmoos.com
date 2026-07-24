// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyPopulation.js
 * @description Owns six independent skeletons, shared surface geometry, targeting, corpses, and loot.
 * The Awtsmoos reveals one creature law through six finite trials; Awtsmoos.com keeps nearest
 * selection, target cycling, corpse persistence, second-click loot, and pack diagnostics explicit.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowEnemyActor } from './MinimalMeadowEnemyActor.js';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from './MinimalMeadowEnemyProfiles.js';

export class MinimalMeadowEnemyPopulation {
	constructor(options) {
		this.camera = options.camera;
		this.group = new Group();
		this.group.name = 'Awtsmoos_six_continuous_skinned_demons';
		this.selected = null;
		this.cycleIndex = -1;
		this.actors = MINIMAL_MEADOW_ENEMY_PROFILES.map(profile => {
			return new MinimalMeadowEnemyActor({
				...options,
				pack: this,
				profile
			});
		});
		for (const actor of this.actors) {
			this.group.add(actor.group);
		}
	}

	update(deltaSeconds) {
		for (const actor of this.actors) {
			actor.update(deltaSeconds);
		}
		if (this.selected?.looted) {
			this.selected = null;
		}
	}

	candidateFromPointer(event) {
		const candidates = this.actors
			.filter(actor => actor.hitPointer(event))
			.map(actor => this.pointerCandidate(actor));
		return candidates.sort(compareDistance)[0] || null;
	}

	pointerCandidate(actor) {
		const hint = actor.targetHint();
		const camera = this.camera.position;
		return {
			actor,
			distance: Math.hypot(
				hint.x - camera.x,
				hint.y - camera.y,
				hint.z - camera.z
			),
			population: this
		};
	}

	activateCandidate(candidate) {
		const actor = candidate.actor;
		if (!actor.alive && this.selected === actor && actor.selected) {
			actor.interact();
			this.selected = null;
			return;
		}
		this.selectActor(actor);
	}

	selectActor(actor) {
		if (!actor || actor.looted) {
			return false;
		}
		if (this.selected && this.selected !== actor) {
			this.selected.clear(true);
		}
		this.selected = actor;
		return actor.target();
	}

	cycleTarget() {
		const living = this.actors.filter(actor => actor.alive);
		if (!living.length) {
			return false;
		}
		this.cycleIndex = (this.cycleIndex + 1) % living.length;
		return this.selectActor(living[this.cycleIndex]);
	}

	clearAll() {
		this.selected?.clear();
		this.selected = null;
	}

	diagnostics() {
		const first = this.actors[0];
		return {
			active: this.actors.filter(actor => actor.alive).length,
			corpses: this.actors.filter(actor => !actor.alive).length,
			independentSkeletons: new Set(
				this.actors.map(actor => actor.group.userData.rig.mesh.skeleton)
			).size,
			lootable: this.actors.filter(actor => !actor.alive && !actor.looted).length,
			proceduralCore: first?.group.userData.proceduralCore || null,
			selectedId: this.selected?.profile.id || null,
			total: this.actors.length
		};
	}
}

function compareDistance(first, second) {
	return first.distance - second.distance;
}
