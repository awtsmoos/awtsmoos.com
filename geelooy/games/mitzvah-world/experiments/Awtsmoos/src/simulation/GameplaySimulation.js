// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplaySimulation.js
 * @description Exposes accelerated commands and deterministic inspection over the real game rules.
 * The Awtsmoos creates command, transition, and receipt in one present; Awtsmoos.com lets jobs
 * traverse hours of movement, collision, combat, equipment, missions, recovery, and actions.
 */

import { createSimulationRuntime } from './SimulationRuntimeFactory.js';
import { SimulationClock } from './SimulationClock.js';
import { inspectGameplaySimulation } from './SimulationInspector.js';

export class GameplaySimulation {
	static async create(options) {
		const runtime = await createSimulationRuntime(options);
		const clock = new SimulationClock(options);
		return new GameplaySimulation(runtime, clock);
	}

	constructor(runtime, clock) {
		this.runtime = runtime;
		this.clock = clock;
	}

	runFor(simulatedSeconds) {
		return this.clock.advance(
			simulatedSeconds,
			deltaSeconds => this.runtime.step(deltaSeconds)
		);
	}

	runScaled(wallBudgetSeconds) {
		return this.runFor(
			Math.max(0, wallBudgetSeconds) * this.clock.speed
		);
	}

	runUntil(predicate, maximumSeconds) {
		return this.clock.runUntil(
			() => predicate(this.snapshot()),
			maximumSeconds,
			deltaSeconds => this.runtime.step(deltaSeconds)
		);
	}

	move(values) {
		return this.runtime.input.setAxis(values);
	}

	stopMoving() {
		this.runtime.input.reset();
	}

	jump() {
		this.runtime.input.requestJump();
	}

	setRun(running) {
		this.runtime.input.setRun(running);
		this.runtime.runToggle = Boolean(running);
	}

	equip(itemId) {
		return this.runtime.inventory.equip(itemId);
	}

	cycleTarget() {
		return this.runtime.enemies.cycleTarget();
	}

	cast(actionId) {
		return this.runtime.combat.activate(actionId);
	}

	perform(command, detail = {}) {
		return this.runtime.lifecycle.execute(command, detail);
	}

	dispatchAction(type, phase, detail = {}) {
		return this.runtime.playerActionSystem.dispatch({
			...detail,
			phase,
			type
		});
	}

	dispatchFriendlyAction(actorId, message) {
		const actor = this.runtime.friendlyActors.find(
			candidate => candidate.definition.id === actorId
		);
		return actor
			? actor.dispatch(message)
			: { accepted: false, reason: 'FRIENDLY_ACTOR_NOT_FOUND' };
	}

	snapshot() {
		return inspectGameplaySimulation(this.runtime, this.clock);
	}

	destroy() {
		this.runtime.progression.destroy();
		this.runtime.combat.destroy?.();
		this.runtime.playerActionSystem.destroy();
		this.runtime.equipment.destroy();
		for (const actor of this.runtime.friendlyActors) {
			actor.destroy();
		}
	}
}
