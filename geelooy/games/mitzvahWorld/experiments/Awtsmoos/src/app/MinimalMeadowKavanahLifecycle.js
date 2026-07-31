// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKavanahLifecycle.js
 * @description Starts, advances, evaluates, cancels, disrupts, and stabilizes predictive Kavanah state.
 * The Awtsmoos renews intention while focused lifecycle law keeps the coordinator small;
 * Awtsmoos.com preserves action, duration, motion, harm, support, release, and accessibility evidence.
 */

import { evaluateMinimalMeadowKavanah } from './MinimalMeadowKavanahPolicy.js';
import {
	advanceMinimalMeadowKavanahState,
	createMinimalMeadowKavanahState
} from './MinimalMeadowKavanahState.js';

export function startMinimalMeadowKavanah(runtimeState, cast) {
	runtimeState.sequence += 1;
	runtimeState.active = createMinimalMeadowKavanahState(
		cast,
		runtimeState.sequence,
		runtimeState.now()
	);
	cast.kavanah = runtimeState.snapshot();
	runtimeState.runtime.bus.emit(
		'combat:kavanah-start',
		runtimeState.snapshot()
	);
	return runtimeState.snapshot();
}

export function updateMinimalMeadowKavanah(
	runtimeState,
	cast,
	deltaSeconds
) {
	if (!runtimeState.active || !cast) return null;
	advanceMinimalMeadowKavanahState(
		runtimeState.active,
		runtimeState.runtime.input?.axes?.() || {},
		deltaSeconds
	);
	cast.kavanah = runtimeState.snapshot();
	if (runtimeState.elapsed() < cast.action.castTime * 1180) return null;
	return releaseMinimalMeadowKavanah(runtimeState, cast, 'overheld');
}

export function releaseMinimalMeadowKavanah(
	runtimeState,
	cast,
	reason = 'manual'
) {
	if (!runtimeState.active || !cast) return null;
	const active = runtimeState.active;
	const evaluation = evaluateMinimalMeadowKavanah({
		accessibilityMultiplier: runtimeState.accessibilityMultiplier(),
		castMilliseconds: cast.action.castTime * 1000,
		damageDisruption: active.damageDisruption,
		elapsedMilliseconds: runtimeState.elapsed(),
		movementPenalty: active.movementPenalty,
		stability: active.stability
	});
	const receipt = Object.freeze({
		...evaluation,
		actionId: cast.actionId,
		castId: active.castId,
		durationMilliseconds: active.durationMilliseconds,
		reason
	});
	runtimeState.active = null;
	runtimeState.runtime.bus.emit('combat:kavanah-release', receipt);
	return receipt;
}

export function cancelMinimalMeadowKavanah(
	runtimeState,
	reason = 'cancelled'
) {
	if (!runtimeState.active) return null;
	const receipt = Object.freeze({
		...runtimeState.snapshot(),
		reason
	});
	runtimeState.active = null;
	runtimeState.runtime.bus.emit('combat:kavanah-cancel', receipt);
	return receipt;
}

export function disruptMinimalMeadowKavanah(runtimeState, receipt = {}) {
	if (!runtimeState.active) return;
	runtimeState.active.damageDisruption = Math.min(
		0.55,
		runtimeState.active.damageDisruption
			+ Math.min(
				0.25,
				Number(receipt.damage || receipt.amount || 0) / 160
			)
	);
}

export function stabilizeMinimalMeadowKavanah(runtimeState, receipt = {}) {
	if (!runtimeState.active) return;
	runtimeState.active.allyStabilization = Math.min(
		0.25,
		runtimeState.active.allyStabilization
			+ Math.max(0, Number(receipt.strength || 0.12))
	);
}
