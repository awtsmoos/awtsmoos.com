// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeController.js
 * @description Converts one edge-triggered key into a bounded physical strike transaction.
 * The Awtsmoos renews intention before impact; Awtsmoos.com lets one finite key awaken one
 * measured attack without polling enemies, allocating every frame, or multiplying listeners.
 */

const DEFAULT_ATTACK = Object.freeze({
	cooldownMilliseconds: 620,
	damage: 18,
	id: 'shliach-staff-strike',
	range: 2.85,
	stagger: 14
});

export class PlayerMeleeController {
	constructor(options) {
		this.bus = options.bus;
		this.clock = options.clock || Date.now;
		this.attack = Object.freeze({ ...DEFAULT_ATTACK, ...(options.attack || {}) });
		this.lastAttackAt = -Infinity;
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
		if (pressed) this.attackNow();
	}

	attackNow() {
		const now = this.clock();
		if (now - this.lastAttackAt < this.attack.cooldownMilliseconds) {
			return this.publishLocalRejection('ATTACK_COOLDOWN', now);
		}
		this.lastAttackAt = now;
		const request = {
			attack: this.attack,
			requestedAt: now,
			sourceId: 'player'
		};
		this.bus.emit('combat:melee', request);
		this.bus.emit('player:attack', request);
		return request;
	}

	receiveResult(result) {
		this.lastResult = result ? structuredClone(result) : null;
	}

	publishLocalRejection(reason, now) {
		const result = {
			accepted: false,
			attackId: this.attack.id,
			reason,
			resolvedAt: now
		};
		this.bus.emit('combat:melee-result', result);
		return result;
	}

	snapshot() {
		return {
			attack: this.attack,
			lastAttackAt: this.lastAttackAt,
			lastResult: this.lastResult
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
