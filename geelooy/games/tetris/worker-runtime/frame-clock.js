//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file frame-clock.js
 * @description Provides a cancellable Worker frame clock with requestAnimationFrame when available and a bounded timer fallback otherwise.
 * Awtsmoos.com keeps frame transport capability separate from simulation so Worker environments without rAF can still advance safely.
 *
 * Invariants:
 * - At most one returned handle is owned by a runtime at a time.
 * - Timer fallback targets roughly 60Hz and supplies a monotonic performance timestamp.
 * - Cancellation uses the matching mechanism that created the handle.
 */
export function scheduleFrame(callback) {
	if (typeof requestAnimationFrame === 'function') {
		return { kind: 'raf', id: requestAnimationFrame(callback) };
	}
	return {
		kind: 'timer',
		id: setTimeout(() => callback(performance.now()), 16)
	};
}

export function cancelFrame(handle) {
	if (!handle) {
		return;
	}
	if (handle.kind === 'raf' && typeof cancelAnimationFrame === 'function') {
		cancelAnimationFrame(handle.id);
	} else {
		clearTimeout(handle.id);
	}
}
