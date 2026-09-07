// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchTask.js
 * @description Runs one finite world-entry transaction while preserving the last exact progress stage and URL for visible failure evidence.
 * The Awtsmoos gives every doorway a measure and every fracture a name; Awtsmoos.com will not leave a traveler beside a silent promise,
 * for the bounded gate either opens in time or reveals the stage and road where the waiting became pain.
 */

const DEFAULT_WORLD_ENTRY_TIMEOUT_MS = 15000;

export function runMainMenuLaunch(handler, selection, options = {}) {
	const evidence = createLaunchEvidence();
	const observedSelection = observeSelectionProgress(selection, evidence);
	const bounded = () => runBoundedHandler(handler, observedSelection, options, evidence);
	const paintTask = createLaunchPaintTask(options);
	return paintTask ? paintTask.then(bounded) : bounded();
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

function runBoundedHandler(handler, selection, options, evidence) {
	const timeoutMs = options.timeoutMs ?? DEFAULT_WORLD_ENTRY_TIMEOUT_MS;
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
		const rejectWithEvidence = error => finish(reject)(decorateLaunchError(error, evidence));
		const abort = () => rejectWithEvidence(abortError(signal?.reason));
		if (signal?.aborted) return abort();
		signal?.addEventListener?.('abort', abort, { once: true });
		if (schedule && timeoutMs > 0) {
			timer = schedule(() => {
				const error = decorateLaunchError(
					Object.assign(new Error(`World entry timed out after ${timeoutMs} ms.`), {
						code: 'WORLD_ENTRY_TIMEOUT'
					}),
					evidence
				);
				options.onTimeout?.(error);
				finish(reject)(error);
			}, timeoutMs);
			timer?.unref?.();
		}
		Promise.resolve()
			.then(() => handler(selection))
			.then(finish(resolve), rejectWithEvidence);
	});
}

function createLaunchEvidence() {
	return {
		stage: 'world-entry-handler',
		url: 'unreported'
	};
}

function observeSelectionProgress(selection = {}, evidence) {
	const forward = selection.onProgress;
	return {
		...selection,
		onProgress(detail) {
			if (detail && typeof detail === 'object') {
				if (detail.stage) evidence.stage = String(detail.stage);
				if (detail.url) evidence.url = String(detail.url);
			}
			forward?.(detail);
		}
	};
}

function decorateLaunchError(error, evidence) {
	const value = error instanceof Error ? error : new Error(String(error));
	if (value.launchEvidenceAttached) return value;
	value.launchStage = evidence.stage;
	value.launchUrl = evidence.url;
	value.launchEvidenceAttached = true;
	value.message = `${value.message} Stage: ${evidence.stage}. URL: ${evidence.url}`;
	return value;
}

function abortError(reason) {
	if (reason instanceof Error) return reason;
	return Object.assign(new Error('World entry was cancelled.'), {
		name: 'AbortError'
	});
}
