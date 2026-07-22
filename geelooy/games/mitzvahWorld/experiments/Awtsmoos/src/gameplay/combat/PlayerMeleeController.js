// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeController.js
 * @description Converts keyboard or hotbar intention into one canonical physical strike transaction.
 * The Awtsmoos renews resolve before the staff can fly; Gevurah is measured, Tiferes keeps time,
 * and Awtsmoos.com sends one bounded request without polling the world or multiplying listeners.
 */

import {
	DEFAULT_PLAYER_MELEE_ATTACK,
	playerMeleeReadiness,
	resolvePlayerMeleeAttack
} from './PlayerMeleeRules.js';

export class PlayerMeleeController {
	constructor(options) {
		this.bus = options.bus;
		this.clock = options.clock || Date.now;
		this.inventory = options.inventory || null;
		this.profile = options.profile || null;
		this.attackTemplate = Object.freeze({
			...DEFAULT_PLAYER_MELEE_ATTACK,
			...(options.attack || {})
		});
		this.lastAttackAt = -Infinity;
		this.nextAttackAt = -Infinity;
		this.keys = new Set();
		this.lastResult = null;
		this.unsubscribers = [
			this.bus.on('input:key', state => this.receiveInput(state)),
			this.bus.on('combat:melee-result', result => this.receiveResult(result))
		];
	}

	receiveInput(state) {
		const nextKeys = new Set(state?.keys || []);
		const pressed = nextKeys.has('KeyF') && !this.keys.has('KeyF');
		this.keys = nextKeys;
		if (pressed) this.attackNow({ source: 'keyboard' });
	}

	attackNow(context = {}) {
		const now = Number.isFinite(context.now) ? context.now : this.clock();
		const readiness = this.readiness(now);
		if (!readiness.ok) return this.publishLocalRejection('ATTACK_COOLDOWN', now, readiness);
		const attack = this.currentAttack();
		this.lastAttackAt = now;
		this.nextAttackAt = now + attack.cooldownMilliseconds;
		const request = {
			attack,
			ok: true,
			reason: 'committed',
			requestedAt: now,
			slotIndex: context.slotIndex ?? null,
			source: context.source || 'action-bar',
			sourceId: 'player'
		};
		this.bus.emit('combat:melee', request);
		this.bus.emit('player:attack', request);
		return request;
	}

	currentAttack() {
		return resolvePlayerMeleeAttack(
			this.attackTemplate,
			this.inventory?.snapshot?.() || null,
			this.profile?.snapshot?.() || null
		);
	}

	readiness(now = this.clock()) {
		return playerMeleeReadiness(now, this.nextAttackAt);
	}

	receiveResult(result) {
		this.lastResult = result ? structuredClone(result) : null;
	}

	publishLocalRejection(reason, now, readiness) {
		const result = {
			accepted: false,
			attackId: this.attackTemplate.id,
			cooldownRemainingMilliseconds: readiness.cooldownRemainingMilliseconds,
			ok: false,
			reason,
			resolvedAt: now
		};
		this.bus.emit('combat:melee-result', result);
		return result;
	}

	snapshot() {
		return {
			attack: this.currentAttack(),
			lastAttackAt: this.lastAttackAt,
			lastResult: this.lastResult,
			nextAttackAt: this.nextAttackAt,
			readiness: this.readiness()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
