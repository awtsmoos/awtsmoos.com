// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKedemWardenRuntime.js
 * @description Orchestrates the bounded Measure, Division, and Concealment boss phases.
 * The Awtsmoos lets one encounter change its vessel without losing lawful identity;
 * Awtsmoos.com makes health thresholds, readable zones, learned concealment, reset, and reward exact.
 */

const BOSS_IDS = new Set(['kedem-letter-warden', 'kedem-warden']);

export class MinimalMeadowKedemWardenRuntime {
	constructor(runtime, saved = {}) {
		this.runtime = runtime;
		this.phase = Number(saved.phase || 1);
		this.defeated = Boolean(saved.defeated);
		this.lastHealthRatio = 1;
		this.unsubscribers = [
			runtime.bus.on('enemy:damaged', event => this.onDamaged(event)),
			runtime.bus.on('enemy:defeated', event => this.onDefeated(event)),
			runtime.bus.on('combat:recovery-complete', () => this.reset('recovery'))
		];
	}

	onDamaged(event = {}) {
		if (!this.isBoss(event)) return null;
		const health = Number(event.health ?? event.currentHealth ?? event.enemy?.health);
		const maximum = Number(event.maxHealth ?? event.maximumHealth ?? event.enemy?.maxHealth);
		if (Number.isFinite(health) && Number.isFinite(maximum) && maximum > 0) {
			this.lastHealthRatio = Math.max(0, Math.min(1, health / maximum));
		}
		const next = this.lastHealthRatio <= 0.34 ? 3 : this.lastHealthRatio <= 0.67 ? 2 : 1;
		if (next !== this.phase) this.transition(next);
		return this.snapshot();
	}

	transition(phase) {
		this.phase = Math.max(1, Math.min(3, Number(phase || 1)));
		const receipt = this.snapshot();
		this.runtime.bus.emit('boss:phase', receipt);
		this.runtime.bus.emit('enemy:telegraph', {
			label: this.phaseLabel(),
			pattern: this.phase === 2 ? 'split-zone' : this.phase === 3 ? 'concealed-glyph' : 'measured-ring',
			phase: this.phase,
			text: this.phaseText()
		});
	}

	onDefeated(event = {}) {
		if (!this.isBoss(event) || this.defeated) return null;
		this.defeated = true;
		const receipt = this.snapshot();
		this.runtime.bus.emit('boss:defeated', receipt);
		this.runtime.verticalSlice?.reward?.grant?.();
		return receipt;
	}

	reset(reason = 'manual') {
		this.phase = 1;
		this.defeated = false;
		this.lastHealthRatio = 1;
		const receipt = Object.freeze({ ...this.snapshot(), reason });
		this.runtime.bus.emit('boss:reset', receipt);
		return receipt;
	}

	isBoss(event = {}) {
		const id = event.profileId || event.enemyId || event.id || event.profile?.id;
		return BOSS_IDS.has(id);
	}

	phaseLabel() {
		return ['Measure', 'Division', 'Concealment and Unification'][this.phase - 1];
	}

	phaseText() {
		if (this.phase === 2) return 'Two bounded zones divide the arena; position before the individual seal.';
		if (this.phase === 3) return 'The exact action name is concealed; clarify the glyph, break posture, then release.';
		return 'The Warden measures movement and guards against repeated frontal pressure.';
	}

	snapshot() {
		return Object.freeze({
			defeated: this.defeated,
			healthRatio: Number(this.lastHealthRatio.toFixed(3)),
			label: this.phaseLabel(),
			phase: this.phase,
			soloScale: 1,
			text: this.phaseText()
		});
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
