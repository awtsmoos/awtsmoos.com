// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityCastRules.js
 * @description Creates bounded cast, concentration, charge, progress, and channel timing truth.
 * The Awtsmoos renews each instant of intention while resistance may bend or break;
 * Awtsmoos.com records one lawful cast identity so a cancelled future cannot wake.
 */
const CHANNEL_TICK_COUNT = 3;
const MAXIMUM_CATCH_UP_TICKS = 3;

export function createAbilityCast(definition, context, now, castId) {
	const phase = castPhase(definition.castType);
	const duration = castDuration(definition, phase);
	const concentration = concentrationFor(definition);
	const tickInterval = phase === 'channeling'
		? duration / CHANNEL_TICK_COUNT
		: 0;
	return {
		castId,
		completesAt: now + duration,
		concentrationRemaining: concentration,
		concentrationResistance: concentration,
		context,
		definition,
		interruptImmuneUntil: now + immunityFor(definition),
		nextTickAt: tickInterval ? now + tickInterval : Infinity,
		phase,
		startedAt: now,
		tickIndex: 0,
		tickInterval
	};
}

export function abilityCastSnapshot(cast, now) {
	if (!cast) return null;
	const duration = Math.max(1, cast.completesAt - cast.startedAt);
	return {
		abilityId: cast.definition.id,
		castId: cast.castId,
		completesAt: cast.completesAt,
		concentrationRemaining: cast.concentrationRemaining,
		concentrationResistance: cast.concentrationResistance,
		interruptible: now >= cast.interruptImmuneUntil,
		phase: cast.phase,
		progress: Math.min(1, Math.max(0, (now - cast.startedAt) / duration)),
		startedAt: cast.startedAt,
		tickIndex: cast.tickIndex
	};
}

export function abilityChargeRatio(cast, now) {
	if (!cast || cast.phase !== 'charging') return 0;
	const duration = Math.max(1, cast.completesAt - cast.startedAt);
	return Math.min(1, Math.max(0.1, (now - cast.startedAt) / duration));
}

export function channelTickPlan(cast, now) {
	if (!cast || cast.phase !== 'channeling' || now < cast.nextTickAt) {
		return null;
	}
	const effectiveNow = Math.min(now, cast.completesAt);
	const pending = Math.floor(
		(effectiveNow - cast.nextTickAt) / cast.tickInterval
	) + 1;
	const remaining = CHANNEL_TICK_COUNT - cast.tickIndex;
	const count = Math.min(pending, remaining, MAXIMUM_CATCH_UP_TICKS);
	cast.tickIndex += count;
	cast.nextTickAt += count * cast.tickInterval;
	return {
		count,
		firstTickIndex: cast.tickIndex - count + 1
	};
}

function castPhase(castType) {
	if (castType === 'channel') return 'channeling';
	if (castType === 'charged') return 'charging';
	return 'casting';
}

function castDuration(definition, phase) {
	const duration = phase === 'channeling'
		? definition.channelMilliseconds
		: definition.castMilliseconds;
	return Math.max(1, Number(duration || 1));
}

function concentrationFor(definition) {
	return Math.max(1, Number(
		definition.interruptResistance
		?? definition.concentration
		?? 1
	));
}

function immunityFor(definition) {
	return Math.max(0, Number(
		definition.interruptImmunityMilliseconds || 0
	));
}
