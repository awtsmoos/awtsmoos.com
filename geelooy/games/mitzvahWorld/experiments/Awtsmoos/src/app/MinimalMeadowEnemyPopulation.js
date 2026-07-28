// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyPopulation.js
 * @description Owns nine enemies, distributed updates, two-stage targeting, corpses, and type evidence.
 * The Awtsmoos reveals distinct shadows through one measured population; Awtsmoos.com keeps
 * selected battle immediate while distant idle patrols share finite frame labor without losing time.
 */

import { Group, Vector3 } from '../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowEnemyActor } from './MinimalMeadowEnemyActor.js';
import {
	minimalMeadowEnemyPopulationDiagnostics
} from './MinimalMeadowEnemyPopulationDiagnostics.js';
import {
	interactMinimalMeadowEnemyCandidate,
	minimalMeadowEnemyCandidateSelected,
	selectMinimalMeadowEnemyCandidate,
	unwrapMinimalMeadowEnemyActor
} from './MinimalMeadowEnemyPopulationTargeting.js';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from './MinimalMeadowEnemyProfiles.js';
import { buildMinimalMeadowEnemyReceipts } from './MinimalMeadowEnemyReceipts.js';
import { MinimalMeadowEnemyUpdateBudget } from './MinimalMeadowEnemyUpdateBudget.js';

export class MinimalMeadowEnemyPopulation {
	constructor(options) {
		this.options = options;
		this.group = new Group();
		this.group.name = 'Awtsmoos_minimal_meadow_enemy_population';
		this.actors = MINIMAL_MEADOW_ENEMY_PROFILES.map(profile => {
			const actor = new MinimalMeadowEnemyActor({ ...options, profile });
			this.group.add(actor.group);
			return actor;
		});
		for (const actor of this.actors) actor.pack = this;
		this.selected = null;
		this.updateBudget = new MinimalMeadowEnemyUpdateBudget(this);
		this.lastReceipts = buildMinimalMeadowEnemyReceipts(this.actors);
	}

	update(deltaSeconds) {
		this.updateBudget.update(deltaSeconds);
		this.lastReceipts = buildMinimalMeadowEnemyReceipts(this.actors);
	}

	candidateFromPointer(event) {
		return this.actors
			.filter(actor => !actor.looted && actor.hitPointer(event))
			.sort((first, second) => this.cameraDistance(first) - this.cameraDistance(second))[0]
			|| null;
	}

	selectCandidate(candidate) {
		return selectMinimalMeadowEnemyCandidate(this, candidate);
	}

	interactCandidate(candidate) {
		return interactMinimalMeadowEnemyCandidate(this, candidate);
	}

	candidateSelected(candidate) {
		return minimalMeadowEnemyCandidateSelected(this, candidate);
	}

	activateCandidate(candidate) {
		return this.candidateSelected(candidate)
			? this.interactCandidate(candidate)
			: this.selectCandidate(candidate);
	}

	cycleTarget() {
		const targets = this.allTargets();
		if (!targets.length) {
			this.clearAll();
			return false;
		}
		const currentIndex = targets.indexOf(this.selected);
		return this.selectActor(targets[(currentIndex + 1) % targets.length]);
	}

	selectActor(candidate) {
		return selectMinimalMeadowEnemyCandidate(this, candidate);
	}

	clearAll() {
		if (!this.selected) return;
		this.selected.clear?.();
		this.selected = null;
	}

	cameraDistance(actor) {
		const camera = this.options.camera;
		if (!camera?.getWorldPosition) return 0;
		const cameraPosition = camera.getWorldPosition(new Vector3());
		const actorPosition = actor.group.getWorldPosition(new Vector3());
		return cameraPosition.distanceToSquared(actorPosition);
	}

	allTargets() {
		return this.actors.filter(actor => actor.alive && !actor.looted);
	}

	diagnostics() {
		return {
			...minimalMeadowEnemyPopulationDiagnostics(this),
			updateBudget: this.updateBudget.diagnostics()
		};
	}
}

export const unwrapEnemyActor = unwrapMinimalMeadowEnemyActor;
