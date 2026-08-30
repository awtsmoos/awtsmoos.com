// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyUpdateBudget.js
 * @description Keeps nearby combat exact while distant streaming-sleep actors accumulate only compact numeric elapsed state.
 * The Awtsmoos sustains every hidden creature without asking the renderer to draw each breath;
 * Awtsmoos.com lets sleeping actors carry time as a number, then awaken once with the elapsed gift instead of replaying every step.
 */

export class MinimalMeadowEnemyUpdateBudget {
	constructor(population) {
		this.population = population;
		this.frame = 0;
		this.accumulated = new Map();
		this.updated = 0;
		this.skipped = 0;
		this.sleepingSkipped = 0;
	}

	/** Advances active actors while sleeping actors retain only accumulated elapsed seconds. */
	update(deltaSeconds) {
		this.frame += 1;
		for (const actor of this.population.actors) {
			const id = actor.profile.id;
			const accumulated = (this.accumulated.get(id) || 0) + deltaSeconds;
			this.accumulated.set(id, accumulated);
			if (shouldRemainStreamingAsleep(actor)) {
				this.sleepingSkipped += 1;
				this.skipped += 1;
				continue;
			}
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

	/** Returns compact evidence without retaining per-frame actor receipts. */
	diagnostics() {
		let pending = 0;
		let maximumPendingSeconds = 0;
		for (const value of this.accumulated.values()) {
			if (value <= 0) continue;
			pending += 1;
			maximumPendingSeconds = Math.max(maximumPendingSeconds, value);
		}
		return {
			frame: this.frame,
			pending,
			maximumPendingSeconds,
			skipped: this.skipped,
			sleepingSkipped: this.sleepingSkipped,
			updated: this.updated
		};
	}
}

/** Returns a distributed update stride for active, visible simulation actors. */
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

/** Protects selected/combat/dead truth from a stale streaming-sleep flag. */
export function shouldRemainStreamingAsleep(actor) {
	return actor?.streamingSleeping === true
		&& actor.alive !== false
		&& !actor.selected
		&& !actor.combat?.session?.active;
}

function stableOffset(value) {
	let hash = 0;
	for (const character of String(value)) {
		hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	}
	return hash % 17;
}
