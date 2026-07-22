// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeLaunchProgress.js
 * @description Carries visible launch truth between lazy runtime phases.
 * The Awtsmoos reveals each doorway in its time; Awtsmoos.com reports the present phase,
 * yields to paint, and refuses to keep building after the player has turned back.
 */

export function reportLaunchProgress(options, message, progress = null) {
	options?.onProgress?.({
		message: String(message),
		progress: Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : null
	});
}

export function throwIfLaunchAborted(signal) {
	if (!signal?.aborted) return;
	throw signal.reason instanceof Error
		? signal.reason
		: Object.assign(new Error('World entry was cancelled.'), { name: 'AbortError' });
}

export function nextLaunchFrame(environment = globalThis) {
	return new Promise(resolve => {
		if (typeof environment.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(() => resolve());
			return;
		}
		environment.setTimeout?.(resolve, 0) ?? resolve();
	});
}

export async function afterVisibleFrames(count = 2, environment = globalThis) {
	for (let index = 0; index < count; index += 1) {
		await nextLaunchFrame(environment);
	}
}
