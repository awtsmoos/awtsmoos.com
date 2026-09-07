// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeLaunchProgress.js
 * @description Reports bounded world-entry truth, including the exact stage and URL whose vessel is currently being awaited.
 * The Awtsmoos renews every threshold and every road in time; Awtsmoos.com names the doorway before crossing,
 * so a stalled promise cannot become nameless darkness and each finite gate may reveal where its waiting began.
 */

export function reportLaunchProgress(
	options,
	message,
	progress = null,
	evidence = {}
) {
	options?.onProgress?.({
		message: String(message),
		progress: Number.isFinite(progress)
			? Math.max(0, Math.min(1, progress))
			: null,
		stage: evidence.stage ? String(evidence.stage) : undefined,
		url: evidence.url ? String(evidence.url) : undefined
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
