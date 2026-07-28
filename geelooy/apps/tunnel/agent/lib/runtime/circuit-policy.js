// B"H
// Boruch Hashem
// Blessed is He

const LAG_REASONS = new Set([
	"kernel_panic_lag_only_p0",
	"kernel_hard_lag_only_p0",
	"kernel_soft_lag_blocks_bulk"
]);

/**
	* @file Names circuit pressure without confusing degradation and disconnection.
	* @description The Awtsmoos lets lag advise while real saturation alone opens.
	*/
function levelForLag(lagMs = 0, limits = {}) {
	const lag = Number(lagMs || 0);
	if (lag >= limits.panicLagMs) return "panic";
	if (lag >= limits.hardLagMs) return "hard";
	if (lag >= limits.softLagMs) return "soft";
	return "closed";
}

function reasonFor(lane, level, queued, limits = {}) {
	if (lane === "p0_control") return "";
	if (lane === "p4_bulk" && queued >= limits.p4QueueLimit) {
		return "p4_backpressure";
	}
	if (lane === "p3_heavy" && queued >= limits.p3QueueLimit) {
		return "p3_backpressure";
	}
	if (level === "panic") return "kernel_panic_lag_only_p0";
	if (level === "hard") return "kernel_hard_lag_only_p0";
	if (level === "soft" && lane === "p4_bulk") {
		return "kernel_soft_lag_blocks_bulk";
	}
	return "";
}

function blockingReason(reason, liveness = {}) {
	if (!reason || LAG_REASONS.has(reason)) return "";
	if (liveness.saturated || /backpressure/.test(reason)) return reason;
	return "";
}

function retryAfterMs(level, reason) {
	if (!reason) return 0;
	if (level === "panic") return 3000;
	if (level === "hard") return 2000;
	return 1000;
}

module.exports = {
	LAG_REASONS,
	blockingReason,
	levelForLag,
	reasonFor,
	retryAfterMs
};
