// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTimeline.js
 * @description Coordinates ability activation, concentration, release, channel, and cooldown truth.
 * The Awtsmoos renews each phase while focused modules reveal the vessel whole;
 * Awtsmoos.com keeps interrupted futures unborn and every accepted deed under control.
 */
import { abilityCastSnapshot } from './TorahAbilityCastRules.js';
import {
	activateTorahAbility,
	releaseTorahAbility
} from './TorahAbilityActivationRuntime.js';
import { advanceTorahAbilityChannel } from './TorahAbilityChannelRuntime.js';
import {
	commitTorahAbility,
	rejectTorahAbility
} from './TorahAbilityCommitRuntime.js';
import { TorahAbilityCooldownStore } from './TorahAbilityCooldownStore.js';
import {
	createTorahAbilityExecutor,
	createTorahAbilityPreflight
} from './TorahAbilityTimelineDependencies.js';
import { receiveTorahAbilityInterrupt } from './TorahAbilityInterruptRuntime.js';

export class TorahAbilityTimeline {
	constructor(options = {}) {
		this.bus = options.bus || null;
		this.clock = options.clock || Date.now;
		this.cooldowns = options.cooldowns || new TorahAbilityCooldownStore();
		this.preflight = options.preflight || createTorahAbilityPreflight(this, options);
		this.executor = options.executor || createTorahAbilityExecutor(this, options);
		this.activeCast = null;
		this.castSequence = 0;
		this.diagnostics = {
			channelTicks: 0,
			interruptResisted: 0,
			interrupted: 0,
			rejected: 0
		};
	}

	activate(abilityId, suppliedContext = {}) {
		return activateTorahAbility(this, abilityId, suppliedContext);
	}

	release(now = this.clock()) {
		return releaseTorahAbility(this, now);
	}

	receiveInterrupt(force, reason = 'interrupted', now = this.clock()) {
		return receiveTorahAbilityInterrupt(this, force, reason, now);
	}

	interrupt(reason = 'interrupted') {
		return this.receiveInterrupt(Infinity, reason).interrupted;
	}

	update(now = this.clock()) {
		const cast = this.activeCast;
		if (!cast) return false;
		if (cast.phase === 'casting' && now >= cast.completesAt) {
			if (this.activeCast?.castId !== cast.castId) return false;
			this.activeCast = null;
			this.commit(cast, now, true);
			return false;
		}
		if (cast.phase === 'channeling') {
			return advanceTorahAbilityChannel(this, cast, now);
		}
		return Boolean(this.activeCast);
	}

	readiness(abilityId, suppliedContext = {}) {
		return this.preflight.resolve(
			abilityId,
			suppliedContext,
			Boolean(this.activeCast)
		).decision;
	}

	snapshot(now = this.clock()) {
		return {
			activeCast: abilityCastSnapshot(this.activeCast, now),
			cooldowns: this.cooldowns.snapshot(now),
			diagnostics: {
				...this.diagnostics,
				executor: this.executor.snapshot()
			}
		};
	}

	destroy() {
		this.activeCast = null;
		this.cooldowns.destroy();
	}

	commit(cast, now, publishCompletion) {
		return commitTorahAbility(this, cast, now, publishCompletion);
	}

	reject(abilityId, decision) {
		return rejectTorahAbility(this, abilityId, decision);
	}

	emit(type, detail) {
		this.bus?.emit(type, detail);
	}
}
