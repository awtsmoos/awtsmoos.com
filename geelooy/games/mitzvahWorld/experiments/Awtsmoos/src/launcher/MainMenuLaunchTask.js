// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchTask.js
 * @description Paints one visible transition task before invoking a bounded world launcher.
 * The Awtsmoos opens the doorway without depending on animation frames; Awtsmoos.com yields
 * one macrotask for paint, then advances even when the tab is hidden or rendering is throttled.
 */

export function runMainMenuLaunch(handler, selection, options = {}) {
	const paintTask = createLaunchPaintTask(options);
	if (!paintTask) return runBoundedHandler(handler, selection, options);
	return paintTask.then(() => runBoundedHandler(handler, selection, options));
}

export function createLaunchPaintTask(options = {}) {
	const environment = options.environment || globalThis;
	const browserDocument = environment.document || globalThis.document;
	const explicit = options.forcePaintTask === true;
	if (!browserDocument && !explicit) return null;
	const schedule = options.paintSchedule
		|| environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	if (!schedule) return Promise.resolve();
	const delayMs = Math.max(0, Number(options.paintDelayMs) || 0);
	return new Promise(resolve => schedule(resolve, delayMs));
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

function abortError(reason) {
	if (reason instanceof Error) return reason;
	return Object.assign(
		new Error('World entry was cancelled.'),
		{ name: 'AbortError' }
	);
}
