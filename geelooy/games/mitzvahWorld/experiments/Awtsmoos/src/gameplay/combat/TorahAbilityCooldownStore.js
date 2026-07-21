// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityCooldownStore.js
 * @description Lazily recovers charges and global cooldowns without timers or per-frame allocation.
 */

export class TorahAbilityCooldownStore {
	constructor() {
		this.abilities = new Map();
		this.globalCooldownUntil = 0;
		this.activations = 0;
	}

	readiness(definition, now) {
		const state = this.stateFor(definition, now);
		if (now < this.globalCooldownUntil) {
			return { ok: false, reason: 'global-cooldown', state: this.snapshotAbility(definition, now) };
		}
		if (state.charges < 1 || now < state.cooldownUntil) {
			return { ok: false, reason: 'cooldown', state: this.snapshotAbility(definition, now) };
		}
		return { ok: true, reason: 'ready', state: this.snapshotAbility(definition, now) };
	}

	commit(definition, now) {
		const state = this.stateFor(definition, now);
		if (state.charges < 1) return false;
		state.charges -= 1;
		if (definition.charges > 1) {
			if (!state.nextChargeAt) state.nextChargeAt = now + definition.chargeRecoveryMilliseconds;
		} else {
			state.cooldownUntil = now + definition.cooldownMilliseconds;
		}
		this.globalCooldownUntil = Math.max(
			this.globalCooldownUntil,
			now + definition.globalCooldownMilliseconds
		);
		this.activations += 1;
		return true;
	}

	update(now) {
		for (const state of this.abilities.values()) this.recover(state, now);
		return this.diagnostics(now);
	}

	snapshotAbility(definition, now) {
		const state = this.stateFor(definition, now);
		const recoveryUntil = state.nextChargeAt || state.cooldownUntil;
		return {
			abilityId: definition.id,
			charges: state.charges,
			cooldownRemainingMilliseconds: Math.max(0, recoveryUntil - now),
			cooldownUntil: recoveryUntil,
			globalCooldownRemainingMilliseconds: Math.max(0, this.globalCooldownUntil - now),
			maximumCharges: definition.charges
		};
	}

	snapshot(now) {
		const abilities = [];
		for (const state of this.abilities.values()) abilities.push(this.snapshotAbility(state.definition, now));
		return { abilities, diagnostics: this.diagnostics(now) };
	}

	diagnostics(now) {
		return {
			activations: this.activations,
			globalCooldownRemainingMilliseconds: Math.max(0, this.globalCooldownUntil - now),
			trackedAbilities: this.abilities.size
		};
	}

	destroy() {
		this.abilities.clear();
		this.globalCooldownUntil = 0;
	}

	stateFor(definition, now) {
		let state = this.abilities.get(definition.id);
		if (!state) {
			state = {
				charges: definition.charges,
				cooldownUntil: 0,
				definition,
				nextChargeAt: 0
			};
			this.abilities.set(definition.id, state);
		}
		this.recover(state, now);
		return state;
	}

	recover(state, now) {
		const definition = state.definition;
		if (definition.charges === 1 && state.charges === 0 && now >= state.cooldownUntil) {
			state.charges = 1;
			state.cooldownUntil = 0;
			return;
		}
		if (!state.nextChargeAt || !definition.chargeRecoveryMilliseconds) return;
		while (state.charges < definition.charges && now >= state.nextChargeAt) {
			state.charges += 1;
			state.nextChargeAt += definition.chargeRecoveryMilliseconds;
		}
		if (state.charges >= definition.charges) state.nextChargeAt = 0;
	}
}
