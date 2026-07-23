// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeLaunchProgress.js
 * @description Reports launch truth and yields without trusting animation frames alone.
 * The Awtsmoos reveals each gate in measure; Awtsmoos.com accepts a painted frame when it
 * arrives, yet a finite timer always opens the next doorway when rendering is throttled.
 */

export function reportLaunchProgress(options, message, progress = null) {
	options?.onProgress?.({
		message: String(message),
		progress: Number.isFinite(progress)
			? Math.max(0, Math.min(1, progress))
			: null
	});
}

export function throwIfLaunchAborted(signal) {
	if (!signal?.aborted) return;
	throw signal.reason instanceof Error
		? signal.reason
		: Object.assign(new Error('World entry was cancelled.'), {
			name: 'AbortError'
		});
}

export function nextLaunchFrame(environment = globalThis, timeoutMs = 48) {
	return new Promise(resolve => {
		let settled = false;
		let timer = null;
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout?.bind(globalThis);
		const cancel = environment.clearTimeout?.bind(environment)
			|| globalThis.clearTimeout?.bind(globalThis);
		const finish = () => {
			if (settled) return;
			settled = true;
			if (timer !== null) cancel?.(timer);
			resolve();
		};
		if (typeof environment.requestAnimationFrame === 'function') {
			if (schedule) {
				timer = schedule(finish, Math.max(16, Number(timeoutMs) || 48));
			}
			environment.requestAnimationFrame(finish);
			return;
		}
		if (schedule) {
			timer = schedule(finish, 0);
			return;
		}
		finish();
	});
}

export function nextLaunchTask(environment = globalThis) {
	if (typeof environment.scheduler?.yield === 'function') {
		return environment.scheduler.yield();
	}
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	return schedule
		? new Promise(resolve => schedule(resolve, 0))
		: Promise.resolve();
}

export async function afterVisibleFrames(count = 2, environment = globalThis) {
	for (let index = 0; index < count; index += 1) {
		await nextLaunchFrame(environment);
	}
}
