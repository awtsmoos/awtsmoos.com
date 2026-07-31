// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPostureRuntime.js
 * @description Owns bounded guard strain, posture breaks, immunity, and deterministic recovery.
 * The Awtsmoos distinguishes life from composure while both remain renewed in one flow;
 * Awtsmoos.com gives every opening a clear threshold, brief mercy, and measured return.
 */

const DEFAULT_MAXIMUM = 100;
const BREAK_DURATION = 1400;
const IMMUNITY_DURATION = 2400;

export class MinimalMeadowPostureRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.states = new Map();
	}

	ensure(targetId, maximum = DEFAULT_MAXIMUM) {
		if (!this.states.has(targetId)) {
			const boundedMaximum = Math.max(1, Number(maximum || DEFAULT_MAXIMUM));
			this.states.set(targetId, {
				brokenUntil: 0,
				immunityUntil: 0,
				maximum: boundedMaximum,
				value: boundedMaximum
			});
		}
		return this.states.get(targetId);
	}

	apply(targetId, amount, options = {}) {
		const now = Number(options.now ?? this.now());
		const state = this.ensure(targetId, options.maximum);
		if (now < state.immunityUntil) return this.receipt(targetId, state, 0, 'immune');
		const pressure = Math.max(0, Number(amount || 0));
		state.value = Math.max(0, state.value - pressure);
		let reason = 'strained';
		if (state.value === 0 && now >= state.brokenUntil) {
			state.brokenUntil = now + BREAK_DURATION;
			state.immunityUntil = state.brokenUntil + IMMUNITY_DURATION;
			reason = 'broken';
		}
		const receipt = this.receipt(targetId, state, pressure, reason);
		this.runtime.bus.emit('combat:posture', receipt);
		return receipt;
	}

	restore(targetId, amount) {
		const state = this.ensure(targetId);
		const restored = Math.max(0, Number(amount || 0));
		state.value = Math.min(state.maximum, state.value + restored);
		return this.receipt(targetId, state, -restored, 'restored');
	}

	update() {
		const now = this.now();
		for (const [targetId, state] of this.states) {
			if (now < state.brokenUntil || state.value >= state.maximum) continue;
			state.value = Math.min(state.maximum, state.value + 0.18);
			if (state.value === state.maximum) {
				this.runtime.bus.emit('combat:posture-recovered', this.receipt(targetId, state, 0, 'recovered'));
			}
		}
	}

	snapshot(targetId) {
		return this.receipt(targetId, this.ensure(targetId), 0, 'snapshot');
	}

	destroy() {
		this.states.clear();
	}

	now() {
		return Math.round(Number(this.runtime.combat?.clock || 0) * 1000);
	}

	receipt(targetId, state, amount, reason) {
		const now = this.now();
		return Object.freeze({
			amount,
			broken: now < state.brokenUntil,
			brokenUntil: state.brokenUntil,
			immunityUntil: state.immunityUntil,
			maximum: state.maximum,
			reason,
			targetId,
			value: Number(state.value.toFixed(2))
		});
	}
}
