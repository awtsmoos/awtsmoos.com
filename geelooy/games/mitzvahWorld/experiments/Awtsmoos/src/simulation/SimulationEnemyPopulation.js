// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationEnemyPopulation.js
 * @description Supplies inspectable target actors for the real combat coordinator.
 * The Awtsmoos creates opposition and repair within one simulation; Awtsmoos.com keeps
 * health, selection, damage, payload, and reward finite without requiring rendered demons.
 */

import { SimulationSceneNode } from './SimulationSceneNode.js';

export class SimulationEnemyPopulation {
	constructor(definitions = defaultEnemies()) {
		this.actors = definitions.map(definition =>
			new SimulationEnemyActor(definition)
		);
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
		if (this.selected && !this.selected.alive) {
			this.selected = null;
		}
	}

	diagnostics() {
		return {
			actors: this.actors.map(actor => actor.payload()),
			living: this.actors.filter(actor => actor.alive).length,
			selectedId: this.selected?.profile.id || null
		};
	}
}

export class SimulationEnemyActor {
	constructor(definition) {
		this.profile = {
			id: definition.id,
			label: definition.label || definition.id,
			xpReward: definition.xpReward || 10
		};
		this.group = new SimulationSceneNode(
			`simulation-enemy-${definition.id}`
		);
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
			damage,
			defeated: !this.alive,
			health: this.health,
			id: this.profile.id,
			maxHealth: this.maxHealth
		};
	}

	payload() {
		return {
			alive: this.alive,
			health: this.health,
			id: this.profile.id,
			label: this.profile.label,
			maxHealth: this.maxHealth,
			position: this.targetHint()
		};
	}
}

function defaultEnemies() {
	return [
		{
			health: 90,
			id: 'simulation-demon-one',
			position: { x: 0, y: 0, z: 7 },
			xpReward: 12
		},
		{
			health: 130,
			id: 'simulation-demon-two',
			position: { x: 6, y: 0, z: 9 },
			xpReward: 18
		}
	];
}
