// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyUpdateBudget.js
 * @description Accumulates time for distant idle enemies while preserving full combat fidelity nearby.
 * The Awtsmoos gives every actor its proper cadence; Awtsmoos.com never skips a selected or engaged
 * shadow, yet lets distant patrols breathe on distributed frames when the renderer carries heavier labor.
 */

export class MinimalMeadowEnemyUpdateBudget {
	constructor(population) {
		this.population = population;
		this.frame = 0;
		this.accumulated = new Map();
		this.updated = 0;
		this.skipped = 0;
	}

	update(deltaSeconds) {
		this.frame += 1;
		for (const actor of this.population.actors) {
			const id = actor.profile.id;
			const accumulated = (this.accumulated.get(id) || 0) + deltaSeconds;
			this.accumulated.set(id, accumulated);
			const stride = enemyUpdateStride(actor, this.population);
			if ((this.frame + stableOffset(id)) % stride !== 0) {
				this.skipped += 1;
				continue;
			}
			actor.update(accumulated);
			this.accumulated.set(id, 0);
			this.updated += 1;
		}
	}

	diagnostics() {
		return {
			frame: this.frame,
			pending: [...this.accumulated.values()].filter(value => value > 0).length,
			skipped: this.skipped,
			updated: this.updated
		};
	}
}

export function enemyUpdateStride(actor, population) {
	if (!actor.alive || actor.selected || actor.combat?.session?.active) return 1;
	const runtime = population.options.runtime;
	const quality = runtime.adaptiveQuality?.level || 'quality';
	const state = runtime.state || {};
	const x = actor.group?.position?.x ?? actor.profile.x ?? 0;
	const z = actor.group?.position?.z ?? actor.profile.z ?? 0;
	const distance = Math.hypot(x - (state.x || 0), z - (state.z || 0));
	if (distance <= 34) return 1;
	if (distance <= 72) return quality === 'performance' ? 3 : 2;
	if (quality === 'quality') return 3;
	if (quality === 'balanced') return 4;
	return 6;
}

function stableOffset(value) {
	let hash = 0;
	for (const character of String(value)) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return hash % 17;
}
