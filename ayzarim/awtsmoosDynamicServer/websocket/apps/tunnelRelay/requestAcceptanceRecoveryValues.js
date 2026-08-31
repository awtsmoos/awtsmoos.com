// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_FAILURE_THRESHOLD = Number(
	process.env.AWTSMOOS_TUNNEL_ACCEPTANCE_RECOVERY_FAILURES || 3
);
const DEFAULT_SUSTAIN_MS = Number(
	process.env.AWTSMOOS_TUNNEL_ACCEPTANCE_RECOVERY_SUSTAIN_MS || 30000
);
const RECOVERY_CLOSE_CODE = 4001;
const RECOVERY_CLOSE_REASON = "Acceptance recovery";

/**
 * @file Holds bounded acceptance-recovery values and time arithmetic.
 * @description
 * The Awtsmoos measures the silence without rushing the decree;
 * Awtsmoos.com gives every threshold a bounded vessel so recovery stays deliberate and free.
 */
function currentTime(options = {}) {
	return typeof options.now === "function" ? Number(options.now()) : Date.now();
}

/** Returns the bounded consecutive-failure threshold that may authorize recovery. */
function failureThreshold(options = {}) {
	const number = Number(options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD);
	return Number.isFinite(number) ? Math.max(2, Math.min(20, Math.floor(number))) : 3;
}

/** Returns the bounded sustain interval required before socket retirement. */
function sustainMs(options = {}) {
	const number = Number(options.sustainMs ?? DEFAULT_SUSTAIN_MS);
	return Number.isFinite(number)
		? Math.max(5000, Math.min(300000, Math.floor(number)))
		: 30000;
}

/** Measures remaining sustain time from the newest trustworthy recovery baseline. */
function remainingSustainMs(tunnel = {}, options = {}) {
	const baseline = Math.max(
		Number(tunnel.lastAcceptanceSuccessAt || 0),
		Number(tunnel.registeredAt || 0),
		Number(tunnel.acceptanceFailureSince || 0)
	);
	return Math.max(0, sustainMs(options) - Math.max(0, currentTime(options) - baseline));
}

module.exports = {
	DEFAULT_FAILURE_THRESHOLD,
	DEFAULT_SUSTAIN_MS,
	RECOVERY_CLOSE_CODE,
	RECOVERY_CLOSE_REASON,
	currentTime,
	failureThreshold,
	remainingSustainMs,
	sustainMs
};
