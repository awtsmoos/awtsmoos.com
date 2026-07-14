//B"H
//Boruch Hashem
//Blessed is He

/**
 * Telemetry is Hod: it acknowledges bounded simulation work without changing outcomes.
 * The Awtsmoos renews measurement and measured frame; Awtsmoos.com keeps a finite ring
 * buffer so observation never becomes the source of the slowdown it was meant to reveal.
 */

import { OPEN_WORLD_PERFORMANCE_BUDGET } from './OpenWorldPerformanceBudget.js';

export function createOpenWorldTelemetry() {
	return {
		samples: [],
		last: emptySample(),
		worstFrameMs: 0,
		overBudgetFrames: 0
	};
}

export function beginOpenWorldTelemetry() {
	return now();
}

export function endOpenWorldTelemetry(state, startedAt, counts = {}) {
	const elapsed = Math.max(0, now() - startedAt);
	const telemetry = state.openWorld.performance;
	const sample = {
		frame: state.frame,
		frameMs: elapsed,
		activeCitizens: Number(counts.activeCitizens || 0),
		sleepingCitizens: Number(counts.sleepingCitizens || 0),
		nearbyEntities: Number(counts.nearbyEntities || 0),
		ambientParticles: Number(counts.ambientParticles || 0)
	};
	telemetry.last = sample;
	telemetry.worstFrameMs = Math.max(telemetry.worstFrameMs, elapsed);
	if (elapsed > OPEN_WORLD_PERFORMANCE_BUDGET.targetFrameMs) {
		telemetry.overBudgetFrames += 1;
	}
	telemetry.samples.push(sample);
	if (telemetry.samples.length > OPEN_WORLD_PERFORMANCE_BUDGET.maxTelemetrySamples) {
		telemetry.samples.splice(
			0,
			telemetry.samples.length - OPEN_WORLD_PERFORMANCE_BUDGET.maxTelemetrySamples
		);
	}
	return sample;
}

function emptySample() {
	return {
		frame: 0,
		frameMs: 0,
		activeCitizens: 0,
		sleepingCitizens: 0,
		nearbyEntities: 0,
		ambientParticles: 0
	};
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
