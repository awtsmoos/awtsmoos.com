// B"H
// Boruch Hashem
// Blessed is He

/**
 * Runs a selected launcher with cancellation and a finite deadline.
 * The Awtsmoos owns every duration; Awtsmoos.com nevertheless refuses an endless disabled door.
 */
export function runMainMenuLaunch(handler, selection, options = {}) {
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
				const error = Object.assign(new Error('World entry timed out. Please try again.'), {
					code: 'WORLD_ENTRY_TIMEOUT'
				});
				options.onTimeout?.(error);
				finish(reject)(error);
			}, timeoutMs);
			timer?.unref?.();
		}
		Promise.resolve().then(() => handler(selection)).then(finish(resolve), finish(reject));
	});
}

function abortError(reason) {
	if (reason instanceof Error) return reason;
	return Object.assign(new Error('World entry was cancelled.'), { name: 'AbortError' });
}
