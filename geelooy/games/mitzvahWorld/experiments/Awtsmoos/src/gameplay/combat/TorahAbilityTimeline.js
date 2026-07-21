// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTimeline.js
 * @description Runs instant, cast, charged, channel, and interrupt transitions on one clock.
 */

import {
	abilityCastSnapshot,
	abilityChargeRatio,
	channelTickPlan,
	createAbilityCast
} from './TorahAbilityCastRules.js';
import { TorahAbilityCooldownStore } from './TorahAbilityCooldownStore.js';
import { TorahAbilityExecutor } from './TorahAbilityExecutor.js';
import { TorahAbilityPreflight } from './TorahAbilityPreflight.js';

const TIMELINED_CAST_TYPES = new Set(['cast', 'charged', 'channel']);

export class TorahAbilityTimeline {
	constructor(options = {}) {
		this.bus = options.bus || null;
		this.clock = options.clock || Date.now;
		this.cooldowns = options.cooldowns || new TorahAbilityCooldownStore();
		this.preflight = options.preflight || new TorahAbilityPreflight({
			clock: this.clock,
			cooldowns: this.cooldowns,
			getContext: options.getContext,
			getResource: options.getResource,
			isUnlocked: options.isUnlocked
		});
		this.executor = options.executor || new TorahAbilityExecutor({
			bus: this.bus,
			cooldowns: this.cooldowns,
			execute: options.execute || (() => ({ ok: false, reason: 'unavailable' })),
			onApply: options.onApply,
			onChannelTick: options.onChannelTick
		});
		this.activeCast = null;
		this.castSequence = 0;
		this.diagnostics = { channelTicks: 0, interrupted: 0, rejected: 0 };
	}

	activate(abilityId, suppliedContext = {}) {
		const resolved = this.preflight.resolve(abilityId, suppliedContext, Boolean(this.activeCast));
		if (!resolved.decision.ok) return this.reject(abilityId, resolved.decision);
		const castId = `torah-cast-${++this.castSequence}`;
		const cast = createAbilityCast(resolved.definition, resolved.context, resolved.now, castId);
		this.emit('torah:cast-start', abilityCastSnapshot(cast, resolved.now));
		if (!TIMELINED_CAST_TYPES.has(resolved.definition.castType)) return this.commit(cast, resolved.now, true);
		this.activeCast = cast;
		if (resolved.definition.castType !== 'channel') return accepted(cast.phase, cast, resolved.now);
		const result = this.commit(cast, resolved.now, false);
		if (!result.ok) this.activeCast = null;
		return result;
	}

	release(now = this.clock()) {
		const cast = this.activeCast;
		if (!cast || cast.phase !== 'charging') return rejected('not-charging');
		cast.context = { ...cast.context, chargeRatio: abilityChargeRatio(cast, now) };
		this.activeCast = null;
		return this.commit(cast, now, true);
	}

	interrupt(reason = 'interrupted') {
		if (!this.activeCast) return false;
		const detail = { ...abilityCastSnapshot(this.activeCast, this.clock()), reason };
		this.activeCast = null;
		this.diagnostics.interrupted += 1;
		this.emit('torah:interrupt', detail);
		return true;
	}

	update(now = this.clock()) {
		const cast = this.activeCast;
		if (!cast) return false;
		if (cast.phase === 'casting' && now >= cast.completesAt) {
			this.activeCast = null;
			this.commit(cast, now, true);
			return false;
		}
		if (cast.phase === 'channeling') this.advanceChannel(cast, now);
		return Boolean(this.activeCast);
	}

	readiness(abilityId, suppliedContext = {}) {
		return this.preflight.resolve(abilityId, suppliedContext, Boolean(this.activeCast)).decision;
	}

	snapshot(now = this.clock()) {
		return {
			activeCast: abilityCastSnapshot(this.activeCast, now),
			cooldowns: this.cooldowns.snapshot(now),
			diagnostics: { ...this.diagnostics, executor: this.executor.snapshot() }
		};
	}

	destroy() {
		this.activeCast = null;
		this.cooldowns.destroy();
	}

	commit(cast, now, publishCompletion) {
		const result = this.executor.commit(cast, now, publishCompletion);
		if (!result.ok) return this.reject(cast.definition.id, result);
		const acceptedResult = accepted(cast.phase === 'channeling' ? 'channeling' : 'complete', cast, now);
		this.emit('actionbar:result', { ...acceptedResult, abilityId: cast.definition.id });
		return acceptedResult;
	}

	advanceChannel(cast, now) {
		const plan = channelTickPlan(cast, now);
		for (let index = 0; index < (plan?.count || 0); index += 1) {
			this.executor.channelTick(cast, now, plan.firstTickIndex + index);
			this.diagnostics.channelTicks += 1;
		}
		if (now < cast.completesAt) return;
		this.activeCast = null;
		this.executor.completeChannel(cast, now);
	}

	reject(abilityId, decision) {
		this.diagnostics.rejected += 1;
		const result = rejected(decision?.reason || 'rejected', decision?.detail, abilityId);
		this.emit('actionbar:result', result);
		return result;
	}

	emit(type, detail) {
		this.bus?.emit(type, detail);
	}
}

function accepted(reason, cast, now) {
	return { cast: abilityCastSnapshot(cast, now), ok: true, reason };
}

function rejected(reason, detail = null, abilityId = null) {
	return { abilityId, detail, ok: false, reason };
}
