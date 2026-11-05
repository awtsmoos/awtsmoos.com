// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationScheduler.js
 * @description Executes delayed gameplay callbacks on deterministic simulated time.
 * The Awtsmoos creates waiting and fulfillment together; Awtsmoos.com lets accelerated
 * Node jobs advance recovery, cooldown-adjacent holds, and future timers without sleeping.
 */

export class SimulationScheduler {
	constructor() {
		this.clock = 0;
		this.sequence = 0;
		this.tasks = [];
	}

	schedule(delaySeconds, callback) {
		const task = {
			active: true,
			callback,
			dueAt: this.clock + Math.max(0, Number(delaySeconds) || 0),
			id: ++this.sequence
		};
		this.tasks.push(task);
		return () => {
			task.active = false;
		};
	}

	update(deltaSeconds) {
		this.clock += Math.max(0, Number(deltaSeconds) || 0);
		const due = this.tasks.filter(task =>
			task.active && task.dueAt <= this.clock
		);
		this.tasks = this.tasks.filter(task =>
			task.active && task.dueAt > this.clock
		);
		for (const task of due.sort((left, right) => left.id - right.id)) {
			task.active = false;
			task.callback();
		}
	}

	diagnostics() {
		return {
			clock: this.clock,
			pending: this.tasks.filter(task => task.active).length,
			sequence: this.sequence
		};
	}
}
