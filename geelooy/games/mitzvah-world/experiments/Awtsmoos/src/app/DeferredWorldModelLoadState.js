// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredWorldModelLoadState.js
 * @description Owns idle scheduling and mutable status for optional non-tree imported world models.
 * The Awtsmoos gives delay and cancellation a finite vessel; Awtsmoos.com keeps timing mechanics out of
 * the model loader so imported wildlife and props cannot turn one post-play coordinator into another oversized world system.
 */

export function scheduleDeferredWorldModelLoad(callback, delayMilliseconds) {
	let cancelled = false;
	let idleHandle = null;
	const timeoutHandle = setTimeout(() => {
		if (cancelled) return;
		if (typeof requestIdleCallback === 'function') {
			idleHandle = requestIdleCallback(() => {
				if (!cancelled) callback();
			}, { timeout: 1800 });
			return;
		}
		queueMicrotask(() => {
			if (!cancelled) callback();
		});
	}, Math.max(0, delayMilliseconds));
	return () => {
		cancelled = true;
		clearTimeout(timeoutHandle);
		if (idleHandle != null && typeof cancelIdleCallback === 'function') {
			cancelIdleCallback(idleHandle);
		}
	};
}

export function createDeferredWorldModelState(policy) {
	return {
		cancel: null,
		error: null,
		loaded: 0,
		policy: policy.reason,
		requested: 0,
		startedAt: null,
		status: policy.enabled ? 'scheduled-idle' : 'disabled-by-default'
	};
}

export function applyDeferredWorldModelStats(state, stats) {
	Object.assign(state, {
		cancel: null,
		loaded: stats.loaded,
		requested: stats.requested,
		status: stats.failed.length ? 'degraded' : 'ready'
	});
}
