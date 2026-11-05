// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationEnemyPopulation.js
 * @description Supplies unique inspectable actors with canonical quest target identities.
 * The Awtsmoos creates opposition and refinement within one simulation; Awtsmoos.com keeps
 * actor, target, health, selection, damage, and reward distinct without rendering a false body.
 */

import { SIMULATION_ENEMY_DEFINITIONS } from './SimulationEnemyCatalog.js';
import { SimulationSceneNode } from './SimulationSceneNode.js';

export class SimulationEnemyPopulation {
	constructor(definitions = SIMULATION_ENEMY_DEFINITIONS) {
		this.actors = definitions.map(definition => new SimulationEnemyActor(definition));
		this.selected = null;
		this.cycleIndex = -1;
	}

	cycleTarget() {
		const living = this.actors.filter(actor => actor.alive);
		if (!living.length) {
			this.selected = null;
			return false;
		}
		this.cycleIndex = (this.cycleIndex + 1) % living.length;
		this.selected = living[this.cycleIndex];
		return true;
	}

	update() {
		if (this.selected && !this.selected.alive) this.selected = null;
	}

	diagnostics() {
		return {
			actors: this.actors.map(actor => actor.payload()),
			living: this.actors.filter(actor => actor.alive).length,
			selectedActorId: this.selected?.profile.actorId || null,
			selectedId: this.selected?.profile.id || null
		};
	}
}

export class SimulationEnemyActor {
	constructor(definition) {
		this.profile = {
			actorId: definition.id,
			id: definition.targetId || definition.id,
			label: definition.label || definition.id,
			xpReward: definition.xpReward || 10
		};
		this.group = new SimulationSceneNode(`simulation-enemy-${definition.id}`);
		this.group.position.set(
			definition.position.x,
			definition.position.y || 0,
			definition.position.z
		);
		this.maxHealth = definition.health || 100;
		this.health = this.maxHealth;
		this.alive = true;
	}

	targetHint() {
		return {
			x: this.group.position.x,
			y: this.group.position.y + 1.1,
			z: this.group.position.z
		};
	}

	applyDamage(amount) {
		const damage = Math.max(0, Number(amount) || 0);
		this.health = Math.max(0, this.health - damage);
		this.alive = this.health > 0;
		return {
			actorId: this.profile.actorId,
			damage,
			defeated: !this.alive,
			health: this.health,
			id: this.profile.id,
			maxHealth: this.maxHealth
		};
	}

	payload() {
		return {
			actorId: this.profile.actorId,
			alive: this.alive,
			health: this.health,
			id: this.profile.id,
			label: this.profile.label,
			maxHealth: this.maxHealth,
			position: this.targetHint()
		};
	}
}
