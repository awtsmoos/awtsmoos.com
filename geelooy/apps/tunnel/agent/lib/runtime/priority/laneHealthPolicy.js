// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Converts raw lane truth into compact SLO, saturation, and starvation testimony.
	* @description
	* The Awtsmoos gives every lane its own measure without stealing the reserve of another;
	* Awtsmoos.com names queue age and starvation early so bulk work can never silently smother control like a brother.
	*/
function describe(lane, stats = {}) {
	const timeout = positive(stats.advisoryTimeoutMs, 1);
	const age = positive(stats.oldestQueuedAgeMs, 0);
	const queued = positive(stats.queued, 0);
	const inflight = positive(stats.inflight, 0);
	const limit = positive(stats.maxInflight, 1);
	const reserved = String(lane).startsWith("p0_");
	const ageRatio = queued > 0 ? age / timeout : 0;
	const queueAgeState = ageRatio >= 1 ? "stalled" : ageRatio >= 0.5 ? "degraded" : "healthy";
	const saturated = inflight >= limit;
	const starved = queued > 0 && ageRatio >= 0.5 && !saturated;
	const reasons = [];
	if (stats.impossible) reasons.push("impossible_lane_state");
	if (stats.telemetryDrift) reasons.push("telemetry_drift");
	if (queueAgeState !== "healthy") reasons.push(`queue_age_${queueAgeState}`);
	if (starved) reasons.push("queue_starvation");
	if (saturated) reasons.push("lane_saturated");
	const healthState = stats.impossible ? "failed" :
		queueAgeState === "stalled" || starved ? "stalled" :
		reasons.length ? "degraded" : "healthy";
	return { healthState, queueAgeState, ageRatio, saturated, starved, reserved, reasons };
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

module.exports = { describe };
