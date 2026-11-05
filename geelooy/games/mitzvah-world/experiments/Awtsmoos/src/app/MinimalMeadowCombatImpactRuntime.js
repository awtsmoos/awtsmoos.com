// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatImpactRuntime.js
 * @description Owns bounded hit-stop, damage direction, feedback, and short anti-chain protection.
 * The Awtsmoos is beyond force and interruption; Awtsmoos.com slows battle presentation
 * without freezing movement, persistence, networking, consumables, dodge, or respawn clocks.
 */

import { minimalMeadowCoreDelayRemaining, minimalMeadowCoreNow } from './MinimalMeadowCoreClock.js';
import {
	MINIMAL_MEADOW_ENEMY_HIT_STOP,
	MINIMAL_MEADOW_PLAYER_HIT_STOP,
	MINIMAL_MEADOW_POST_HIT_PROTECTION,
	minimalMeadowImpactDirection,
	minimalMeadowImpactDuration,
	minimalMeadowImpactEnvironmental
} from './MinimalMeadowCombatImpactPolicy.js';

export class MinimalMeadowCombatImpactRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.hitStopUntil = 0;
		this.postHitUntil = 0;
		this.lastDirection = null;
		this.unsubscribe = runtime.bus.on('enemy:damaged', event => {
			if (Number(event?.damage || 0) > 0) this.onEnemyHit(event);
		});
	}

	blockedReason(details = {}) {
		if (minimalMeadowImpactEnvironmental(details)) return null;
		if (this.runtime.dodge?.blocksIncoming?.(details)) return 'DODGE_INVULNERABLE';
		if (minimalMeadowCoreNow(this.environment) < this.postHitUntil) {
			return 'POST_HIT_PROTECTION';
		}
		return null;
	}

	onPlayerHit(receipt = {}) {
		if (receipt.accepted === false || Number(receipt.damage || 0) <= 0) return null;
		const now = minimalMeadowCoreNow(this.environment);
		this.postHitUntil = Math.max(
			this.postHitUntil,
			now + MINIMAL_MEADOW_POST_HIT_PROTECTION
		);
		this.extendHitStop(now, MINIMAL_MEADOW_PLAYER_HIT_STOP);
		this.lastDirection = minimalMeadowImpactDirection(this.runtime, receipt);
		const feedback = Object.freeze({
			damage: receipt.damage,
			direction: this.lastDirection,
			kind: 'player-hit',
			postHitProtection: MINIMAL_MEADOW_POST_HIT_PROTECTION
		});
		this.runtime.bus.emit('combat:impact-feedback', feedback);
		return feedback;
	}

	onEnemyHit(event = {}) {
		const now = minimalMeadowCoreNow(this.environment);
		this.extendHitStop(now, MINIMAL_MEADOW_ENEMY_HIT_STOP);
		const feedback = Object.freeze({
			damage: Number(event.damage || 0),
			kind: 'enemy-hit',
			targetId: event.id || event.enemyId || null
		});
		this.runtime.bus.emit('combat:impact-feedback', feedback);
		return feedback;
	}

	scaleCombatDelta(deltaSeconds) {
		return minimalMeadowCoreNow(this.environment) < this.hitStopUntil
			? Math.max(0, Number(deltaSeconds) || 0) * 0.12
			: deltaSeconds;
	}

	snapshot() {
		const now = minimalMeadowCoreNow(this.environment);
		return Object.freeze({
			hitStopRemaining: minimalMeadowCoreDelayRemaining(this.hitStopUntil, now),
			lastDirection: this.lastDirection ? Object.freeze({ ...this.lastDirection }) : null,
			postHitProtectionRemaining: minimalMeadowCoreDelayRemaining(this.postHitUntil, now)
		});
	}

	destroy() {
		this.unsubscribe?.();
	}

	extendHitStop(now, duration) {
		const bounded = minimalMeadowImpactDuration(this.runtime, this.environment, duration);
		this.hitStopUntil = Math.max(this.hitStopUntil, now + bounded);
	}
}
