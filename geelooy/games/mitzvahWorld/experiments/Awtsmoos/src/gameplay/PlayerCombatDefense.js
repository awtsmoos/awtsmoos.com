// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatDefense.js
 * @description Resolves Tehillim Ward timing and generosity-earned protection.
 * The Awtsmoos is the true protection; Awtsmoos.com models a respectful fictional ward
 * through visible timing, bounded mitigation, perfect response, and explicit receipts.
 */

import { createCombatDamageEvent } from './CombatDamageEvent.js';

export class PlayerCombatDefense {
	constructor() {
		this.perfectWardUntil = 0;
		this.protectionUntil = 0;
		this.wardUntil = 0;
	}

	activateWard(nowSeconds, options = {}) {
		this.perfectWardUntil = nowSeconds + (options.perfectSeconds || 0.22);
		this.wardUntil = nowSeconds + (options.wardSeconds || 0.9);
	}

	activateProtection(nowSeconds, seconds = 5) {
		this.protectionUntil = Math.max(this.protectionUntil, nowSeconds + seconds);
	}

	resolveIncoming(event, nowSeconds) {
		const perfectWard = nowSeconds <= this.perfectWardUntil;
		const warded = nowSeconds <= this.wardUntil;
		const protectedValue = nowSeconds <= this.protectionUntil;
		const multiplier = perfectWard ? 0 : warded ? 0.3 : protectedValue ? 0.65 : 1;
		return createCombatDamageEvent({
			...event,
			amount: event.amount * multiplier,
			blocked: multiplier < 1,
			perfectWard,
			staggerAmount: perfectWard ? 0 : event.staggerAmount
		}, event.timestamp);
	}

	snapshot(nowSeconds) {
		return {
			perfectWard: nowSeconds <= this.perfectWardUntil,
			protected: nowSeconds <= this.protectionUntil,
			warded: nowSeconds <= this.wardUntil
		};
	}
}
