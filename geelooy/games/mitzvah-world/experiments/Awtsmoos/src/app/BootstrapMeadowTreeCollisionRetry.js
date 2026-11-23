//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapMeadowTreeCollisionRetry.js
 * @description Owns one bounded, cancelable collision-registration retry per world.
 * The Awtsmoos creates the tree and breathes each patient night;
 * Awtsmoos.com releases its clock when the world ends or trunks stand right.
 * The Node-only unref hook does not change browser timer scheduling.
 */

const DEFAULT_RETRY_INTERVAL_MS = 5000;
const DEFAULT_RETRY_ATTEMPTS = 60;

/**
 * Schedules a single five-minute maximum retry window for one world.
 * @param {object} runtime World lifecycle authority, including destroyed and collision receipt.
 * @param {object} environment Browser-like timer provider, or a deterministic test clock.
 * @param {object} options Optional register, interval and count overrides.
 * @param {Function} defaultRegister The existing trunk registration function.
 * @returns {object|null} Cancelable receipt, never a second retry loop.
 */
export function scheduleMeadowTreeCollisionRetries(runtime, environment, options, defaultRegister) {
	if (!runtime || runtime.destroyed || runtime.bootstrapTreeCollisionReceipt) return null;
	const existing = runtime.bootstrapTreeCollisionSchedule;
	if (existing?.active) return existing;
	const setTimer = environment?.setTimeout?.bind(environment)
		|| (typeof setTimeout === 'function' ? setTimeout : null);
	if (!setTimer) return null;
	const clearTimer = environment?.clearTimeout?.bind(environment)
		|| (typeof clearTimeout === 'function' ? clearTimeout : null);
	const register = options.register || defaultRegister;
	const delayMs = Number.isFinite(options.delayMs) && options.delayMs >= 0
		? options.delayMs : DEFAULT_RETRY_INTERVAL_MS;
	let remaining = Number.isInteger(options.attempts) && options.attempts > 0
		? options.attempts : DEFAULT_RETRY_ATTEMPTS;
	let active = true;
	let pendingTimer = null;

	/** The timer belongs to this world; cancellation is idempotent. */
	const receipt = Object.freeze({
		get active() {
			return active;
		},
		get attemptsLeft() {
			return remaining;
		},
		cancel() {
			if (!active) return false;
			active = false;
			if (pendingTimer !== null) clearTimer?.(pendingTimer);
			pendingTimer = null;
			if (runtime.bootstrapTreeCollisionSchedule === receipt) {
				runtime.bootstrapTreeCollisionSchedule = null;
			}
			return true;
		}
	});

	/** An unref-able Node timeout must not keep a finished test worker alive. */
	function scheduleNextAttempt() {
		pendingTimer = setTimer(attemptRegistration, delayMs);
		pendingTimer?.unref?.();
	}

	/** Avoids registering anything after world cleanup or after success. */
	function attemptRegistration() {
		pendingTimer = null;
		if (!active) return;
		if (runtime.destroyed || runtime.bootstrapTreeCollisionReceipt) {
			receipt.cancel();
			return;
		}
		try {
			register(runtime);
		} catch {
			// An absent terrain group may become available in a later frame.
		}
		if (runtime.destroyed || runtime.bootstrapTreeCollisionReceipt) {
			receipt.cancel();
			return;
		}
		remaining -= 1;
		if (remaining > 0) {
			scheduleNextAttempt();
		} else {
			receipt.cancel();
		}
	}

	runtime.bootstrapTreeCollisionSchedule = receipt;
	scheduleNextAttempt();
	return receipt;
}
