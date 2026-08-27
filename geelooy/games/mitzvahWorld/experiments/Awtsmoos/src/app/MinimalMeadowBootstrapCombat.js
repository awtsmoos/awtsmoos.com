// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapCombat.js
 * @description Provides responsive actions, elapsed-time cooldowns, stamina truth, cancellation, and diagnostics.
 * The Awtsmoos gives intention a working vessel before every effect garment descends;
 * Awtsmoos.com keeps action identity, real time, stamina, cooldown, bus receipts, and replacement explicit.
 */

const ACTIONS = Object.freeze({
	'hebrew-fire': Object.freeze({ cooldown: 2.5, stamina: 18 }),
	'letter-light': Object.freeze({ cooldown: 1.85, stamina: 14 }),
	'guarded-thought': Object.freeze({ cooldown: 4.2, stamina: 12 }),
	'waters-of-purification': Object.freeze({ cooldown: 6, stamina: 16 })
});

export class MinimalMeadowBootstrapCombat {
	constructor(runtime) {
		this.runtime = runtime;
		this.cooldowns = new Map();
		this.lastAction = null;
		this.lastRefresh = nowSeconds();
		this.suspended = false;
		this.unsubscribe = runtime.bus.on('combat:activate', request => {
			this.activate(request?.actionId);
		});
	}

	activate(actionId) {
		this.refresh();
		const action = ACTIONS[actionId];
		if (this.suspended || !action) return this.reject('ACTION_UNAVAILABLE');
		const now = nowSeconds();
		const readyAt = this.cooldowns.get(actionId) || 0;
		if (readyAt > now) return this.reject('ACTION_COOLDOWN');
		if (this.runtime.playerStats.stamina < action.stamina) {
			return this.reject('STAMINA_REQUIRED');
		}
		this.runtime.playerStats.stamina -= action.stamina;
		this.cooldowns.set(actionId, now + action.cooldown);
		this.lastAction = Object.freeze({ actionId, at: now });
		const receipt = Object.freeze({
			accepted: true,
			actionId,
			bootstrap: true,
			cooldown: action.cooldown
		});
		this.runtime.bus.emit('combat:bootstrap-action', receipt);
		return receipt;
	}

	update() {
		this.refresh();
		return this.diagnostics();
	}

	cancel(reason = 'CANCELLED') {
		this.runtime.bus.emit('combat:cancelled', {
			bootstrap: true,
			reason
		});
		return true;
	}

	diagnostics() {
		this.refresh();
		return Object.freeze({
			bootstrap: true,
			lastAction: this.lastAction,
			stamina: this.runtime.playerStats.stamina,
			suspended: this.suspended
		});
	}

	suspend() {
		this.suspended = true;
	}

	resume() {
		this.lastRefresh = nowSeconds();
		this.suspended = false;
	}

	destroy() {
		this.unsubscribe?.();
	}

	refresh() {
		const now = nowSeconds();
		const elapsed = Math.max(0, now - this.lastRefresh);
		this.lastRefresh = now;
		this.runtime.playerStats.stamina = Math.min(
			this.runtime.playerStats.maxStamina,
			this.runtime.playerStats.stamina + elapsed * 12
		);
	}

	reject(reason) {
		const receipt = Object.freeze({ accepted: false, reason });
		this.runtime.bus.emit('combat:rejected', receipt);
		return receipt;
	}
}

function nowSeconds() {
	const milliseconds = globalThis.performance?.now?.() ?? Date.now();
	return milliseconds / 1000;
}
