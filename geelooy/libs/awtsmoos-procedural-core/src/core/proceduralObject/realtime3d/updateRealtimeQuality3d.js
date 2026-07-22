// B"H
// Boruch Hashem
// Blessed is He
/** Hysteresis lets quality breathe without flickering between neighboring worlds. */

import {
	REALTIME_LIQUID_QUALITY_TIERS,
	resolveRealtimeLiquidQualityTier
} from "./realtimeQualityTiers.js";

export function createRealtimeQualityState3d(profile, input = {}) {
	const qualityIndex = resolveRealtimeLiquidQualityTier(
		input.qualityIndex ?? profile.initialQualityIndex
	).index;
	return Object.freeze({
		qualityIndex,
		qualityId: REALTIME_LIQUID_QUALITY_TIERS[qualityIndex].id,
		overBudgetFrames: Math.max(0, Math.floor(input.overBudgetFrames ?? 0)),
		underBudgetFrames: Math.max(0, Math.floor(input.underBudgetFrames ?? 0)),
		cooldownFrames: Math.max(0, Math.floor(input.cooldownFrames ?? 0)),
		changeCount: Math.max(0, Math.floor(input.changeCount ?? 0))
	});
}

export function updateRealtimeQuality3d(stateInput, telemetry, profile) {
	const state = createRealtimeQualityState3d(profile, stateInput);
	const ratio = telemetry.ewmaTotalMs / Math.max(profile.frameBudgetMs, 1e-9);
	let overBudgetFrames = ratio > profile.downgradeRatio
		? state.overBudgetFrames + 1
		: 0;
	let underBudgetFrames = ratio < profile.upgradeRatio
		? state.underBudgetFrames + 1
		: 0;
	let cooldownFrames = Math.max(0, state.cooldownFrames - 1);
	let qualityIndex = state.qualityIndex;
	let changed = false;
	if (profile.adaptive && cooldownFrames === 0) {
		if (overBudgetFrames >= profile.downgradeFrames
			&& qualityIndex > profile.minimumQualityIndex) {
			qualityIndex -= 1;
			changed = true;
		} else if (underBudgetFrames >= profile.upgradeFrames
			&& qualityIndex < profile.maximumQualityIndex) {
			qualityIndex += 1;
			changed = true;
		}
	}
	if (changed) {
		overBudgetFrames = 0;
		underBudgetFrames = 0;
		cooldownFrames = profile.cooldownFrames;
	}
	return createRealtimeQualityState3d(profile, {
		qualityIndex,
		overBudgetFrames,
		underBudgetFrames,
		cooldownFrames,
		changeCount: state.changeCount + (changed ? 1 : 0)
	});
}
