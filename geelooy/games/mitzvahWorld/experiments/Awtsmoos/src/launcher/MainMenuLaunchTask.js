// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchTask.js
 * @description Paints the transition before running a bounded selected-world launcher.
 * The Awtsmoos opens a visible threshold before heavy creation; Awtsmoos.com grants two
 * browser frames for the progress vessel without delaying non-browser tests by a microtask.
 */

export function runMainMenuLaunch(handler, selection, options = {}) {
	const paintPromise = waitForLaunchPaint(
		options.environment || globalThis,
		options.paintFrames
	);
	if (!paintPromise) return runBoundedHandler(handler, selection, options);
	return paintPromise.then(() => runBoundedHandler(handler, selection, options));
}

function runBoundedHandler(handler, selection, options) {
	const timeoutMs = options.timeoutMs ?? 60000;
	const signal = options.signal;
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	const cancelSchedule = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
	return new Promise((resolve, reject) => {
		let settled = false;
		let timer = null;
		const finish = callback => value => {
			if (settled) return;
			settled = true;
			if (timer !== null) cancelSchedule?.(timer);
			signal?.removeEventListener?.('abort', abort);
			callback(value);
		};
		const abort = () => finish(reject)(abortError(signal?.reason));
		if (signal?.aborted) {
			abort();
			return;
		}
		signal?.addEventListener?.('abort', abort, { once: true });
		if (schedule && timeoutMs > 0) {
			timer = schedule(() => {
				const error = Object.assign(
					new Error('World entry timed out. Please try again.'),
					{ code: 'WORLD_ENTRY_TIMEOUT' }
				);
				options.onTimeout?.(error);
				finish(reject)(error);
			}, timeoutMs);
			timer?.unref?.();
		}
		Promise.resolve()
			.then(() => handler(selection))
			.then(finish(resolve), finish(reject));
	});
}

function waitForLaunchPaint(environment, requestedFrames) {
	const defaultFrames = typeof document === 'undefined' ? 0 : 2;
	const frames = Math.max(
		0,
		Number.isFinite(requestedFrames) ? requestedFrames : defaultFrames
	);
	if (frames === 0) return null;
	return paintFrames(environment, frames);
}

async function paintFrames(environment, frames) {
	for (let index = 0; index < frames; index += 1) {
		await new Promise(resolve => {
			if (typeof environment.requestAnimationFrame === 'function') {
				environment.requestAnimationFrame(() => resolve());
				return;
			}
			environment.setTimeout?.(resolve, 0) ?? resolve();
		});
	}
}

function abortError(reason) {
	if (reason instanceof Error) return reason;
	return Object.assign(
		new Error('World entry was cancelled.'),
		{ name: 'AbortError' }
	);
}
