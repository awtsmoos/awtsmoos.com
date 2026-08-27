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
import { PlayerMeleeTurnGateway } from './PlayerMeleeTurnGateway.js';

export class PlayerMeleeController {
	constructor(options) {
		this.bus = options.bus;
		this.clock = options.clock || Date.now;
		this.inventory = options.inventory || null;
		this.profile = options.profile || null;
		this.turnGateway = new PlayerMeleeTurnGateway(options.turns || null);
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
		if (!readiness.ok) return this.publishLocalRejection(rejectionCode(readiness), now, readiness);
		const attack = this.currentAttack();
		const turnDecision = this.turnGateway.reserve(attack, context, now);
		if (!turnDecision.ok) return this.publishLocalRejection(turnDecision.reason, now, turnDecision);
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
		return this.turnGateway.readiness(now, playerMeleeReadiness(now, this.nextAttackAt));
	}

	receiveResult(result) {
		this.lastResult = result ? structuredClone(result) : null;
	}

	publishLocalRejection(reason, now, readiness) {
		const result = {
			accepted: false,
			attackId: this.attackTemplate.id,
			cooldownRemainingMilliseconds: readiness.cooldownRemainingMilliseconds || 0,
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

function rejectionCode(readiness) {
	return readiness.reason === 'attack-cooldown' ? 'ATTACK_COOLDOWN' : readiness.reason;
}
