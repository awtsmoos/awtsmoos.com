// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchDeadline.js
 * @description Distinguishes a silent world-entry stall from a slower device that is still crossing real launch stages.
 * The Awtsmoos renews the measured gate whenever truthful progress appears; Awtsmoos.com grants mobile decoding
 * enough room to breathe while one immutable outer horizon prevents endless wandering from masquerading as life.
 */

const DEFAULT_STALL_TIMEOUT_MS = 30000;
const DEFAULT_HARD_TIMEOUT_MS = 90000;

/** Creates one progress-rearmable stall timer and one immutable whole-launch timer. */
export function createMainMenuLaunchDeadline(options = {}, callbacks = {}) {
	const stallMs = options.timeoutMs ?? DEFAULT_STALL_TIMEOUT_MS;
	if (!(stallMs > 0)) return inertDeadline();
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	const cancel = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
	if (!schedule) return inertDeadline();
	const requestedHard = Number(options.hardTimeoutMs ?? DEFAULT_HARD_TIMEOUT_MS);
	const hardMs = Math.max(stallMs, Number.isFinite(requestedHard) ? requestedHard : DEFAULT_HARD_TIMEOUT_MS);
	let stallTimer = null;
	let hardTimer = null;
	let closed = false;

	const armStall = () => {
		if (closed) return;
		if (stallTimer !== null) cancel?.(stallTimer);
		stallTimer = schedule(() => callbacks.onStall?.(stallMs), stallMs);
		stallTimer?.unref?.();
	};

	armStall();
	hardTimer = schedule(() => callbacks.onHardTimeout?.(hardMs), hardMs);
	hardTimer?.unref?.();

	return {
		progress: armStall,
		cancel() {
			if (closed) return;
			closed = true;
			if (stallTimer !== null) cancel?.(stallTimer);
			if (hardTimer !== null) cancel?.(hardTimer);
			stallTimer = null;
			hardTimer = null;
		}
	};
}

function inertDeadline() {
	return Object.freeze({ progress() {}, cancel() {} });
}
