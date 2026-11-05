// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMultiEnemySoakFixture.mjs
 * @description Builds nine actor-shaped enemies around the real cadence and percentile owners.
 * The Awtsmoos gives each finite shadow one measured update witness; Awtsmoos.com keeps
 * near fidelity, distant distribution, receipts, counts, timing, and post-soak stability inspectable.
 */

import {
	MinimalMeadowEnemyReceiptCadence
} from '../../app/MinimalMeadowEnemyReceiptCadence.js';
import {
	MinimalMeadowEnemyUpdateBudget
} from '../../app/MinimalMeadowEnemyUpdateBudget.js';
import {
	FrameBudgetWindow
} from '../../performance/FrameBudgetWindow.js';

export function runMinimalMeadowMultiEnemySoak(options = {}) {
	const frames = Math.max(120, Number(options.frames || 1200));
	const actors = createActors();
	const population = createPopulation(actors);
	const budget = new MinimalMeadowEnemyUpdateBudget(population);
	const cadence = new MinimalMeadowEnemyReceiptCadence(actors);
	const timing = new FrameBudgetWindow({ capacity: frames });
	const initialCount = actors.length;
	for (let frame = 0; frame < frames; frame += 1) {
		const started = performance.now();
		budget.update(1 / 60);
		cadence.update(1 / 60);
		timing.push(Math.max(0.001, performance.now() - started));
	}
	const receipt = Object.freeze({
		actorCount: actors.length,
		budget: budget.diagnostics(),
		frames,
		initialCount,
		postSettleStable: actors.length === initialCount,
		receipts: cadence.diagnostics(),
		timing: timing.snapshot(),
		updates: Object.freeze(Object.fromEntries(
			actors.map(actor => [actor.profile.id, actor.updateCount])
		))
	});
	return receipt;
}

function createPopulation(actors) {
	return {
		actors,
		options: {
			runtime: {
				adaptiveQuality: { level: 'balanced' },
				state: { x: 0, z: 0 }
			}
		}
	};
}

function createActors() {
	return Array.from({ length: 9 }, (_, index) => {
		const near = index < 3;
		const selected = index === 0;
		const engaged = index === 1;
		const distance = near ? 8 + index * 4 : 48 + index * 12;
		return {
			alive: true,
			combat: { session: { active: engaged } },
			group: {
				position: { x: distance, y: 0, z: distance / 2 },
				userData: {},
				visible: true
			},
			health: 100,
			lootState: { snapshot: () => [] },
			looted: false,
			profile: { id: `soak-enemy-${index}`, x: distance, z: distance / 2 },
			selected,
			updateCount: 0,
			payload() {
				return {
					alive: this.alive,
					health: this.health,
					id: this.profile.id,
					looted: this.looted
				};
			},
			update(deltaSeconds) {
				this.updateCount += 1;
				this.health -= Math.sin(this.updateCount * deltaSeconds) * 0.00001;
			}
		};
	});
}
