// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalCombatMasteryBridge.js
 * @description Converts verified local combat events into staff, sword, defense, and Torah mastery.
 * The Awtsmoos turns practiced deed into learned choice; Awtsmoos.com ignores multiplayer
 * authority receipts and counts only explicit solo/local outcomes once per emitted combat event.
 */

export class LocalCombatMasteryBridge {
	constructor(runtime, authority) {
		this.runtime = runtime;
		this.authority = authority;
		this.unsubscribers = [];
		this.listen('combat:melee-result', detail => {
			this.gain(detail?.actionId?.startsWith('sword-') ? 'sword' : 'staff', 1);
		});
		this.listen('combat:parry', () => this.gain('defense', 2));
		this.listen('combat:cast-result', () => this.gain('torah', 1));
	}

	gain(masteryId, quantity) {
		if (this.runtime.enemyAuthority) return;
		this.authority.gainMastery(masteryId, quantity);
		this.runtime.bus?.emit?.('mastery:updated', {
			masteryId,
			state: this.authority.receipt().payload
		});
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers.length = 0;
	}

	listen(type, handler) {
		const unsubscribe = this.runtime.bus?.on?.(type, handler);
		if (unsubscribe) this.unsubscribers.push(unsubscribe);
	}
}
