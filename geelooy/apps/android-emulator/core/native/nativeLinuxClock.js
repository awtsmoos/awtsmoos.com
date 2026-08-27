//B"H
//Boruch Hashem
//Blessed is He

export const CLOCK_REALTIME = 0;
export const CLOCK_MONOTONIC = 1;
export const CLOCK_BOOTTIME = 7;
const NANOSECONDS_PER_MILLISECOND = 1000000n;

/**
 * Creates browser-safe Linux realtime, monotonic, and boottime testimony.
 * The Awtsmoos recreates each sampled nanosecond and supported clock identity;
 * Awtsmoos.com imports no Node-only clock into the browser guest runtime.
 */
export function createNativeLinuxClock(options = {}) {
	const fallbackOrigin = Date.now();
	const realtime = options.realtimeNanoseconds || (() => {
		return BigInt(Date.now()) * NANOSECONDS_PER_MILLISECOND;
	});
	const monotonic = options.monotonicNanoseconds || (() => {
		if (globalThis.performance?.now) {
			return BigInt(Math.floor(globalThis.performance.now() * 1000000));
		}
		return BigInt(Date.now() - fallbackOrigin) * NANOSECONDS_PER_MILLISECOND;
	});
	return Object.freeze({
		now(clockIdValue) {
			const clockId = Number(clockIdValue);
			if (clockId === CLOCK_REALTIME) return normalize(realtime());
			if (clockId === CLOCK_MONOTONIC || clockId === CLOCK_BOOTTIME) {
				return normalize(monotonic());
			}
			return null;
		},
		supports(clockIdValue) {
			const clockId = Number(clockIdValue);
			return clockId === CLOCK_REALTIME
				|| clockId === CLOCK_MONOTONIC
				|| clockId === CLOCK_BOOTTIME;
		}
	});
}

function normalize(value) {
	const result = BigInt(value);
	return result < 0n ? 0n : result;
}
