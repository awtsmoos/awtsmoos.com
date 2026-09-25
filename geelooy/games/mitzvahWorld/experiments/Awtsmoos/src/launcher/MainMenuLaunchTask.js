// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchTask.js
 * @description Runs one finite world-entry transaction with progress-aware stall detection and exact failure evidence.
 * The Awtsmoos gives every doorway a measure without confusing slowness with death; Awtsmoos.com renews the stall gate
 * when a real threshold is crossed, while one outer horizon still names a launch that truly cannot arrive.
 */

import { restartMitzvahWorldEssentialBoot } from '../app/MitzvahWorldEssentialBoot.js';
import { createMainMenuLaunchDeadline } from './MainMenuLaunchDeadline.js';

export function runMainMenuLaunch(handler, selection, options = {}) {
	restartWorldEntryEssentialGate(options.environment || globalThis);
	const evidence = createLaunchEvidence();
	const bounded = () => runBoundedHandler(handler, selection, options, evidence);
	const paintTask = createLaunchPaintTask(options);
	return paintTask ? paintTask.then(bounded) : bounded();
}

function restartWorldEntryEssentialGate(environment) {
	try {
		restartMitzvahWorldEssentialBoot(environment);
	} catch (error) {
		environment?.console?.warn?.('B"H MitzvahWorld essential-gate restart failed; continuing world entry.', error);
	}
}

export function createLaunchPaintTask(options = {}) {
	const environment = options.environment || globalThis;
	const browserDocument = environment.document || globalThis.document;
	if (!browserDocument && options.forcePaintTask !== true) return null;
	const schedule = options.paintSchedule
		|| environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	if (!schedule) return Promise.resolve();
	const delayMs = Math.max(0, Number(options.paintDelayMs) || 0);
	return new Promise(resolve => schedule(resolve, delayMs));
}

function runBoundedHandler(handler, selection, options, evidence) {
	const signal = options.signal;
	return new Promise((resolve, reject) => {
		let settled = false;
		let deadline = null;
		const finish = callback => value => {
			if (settled) return;
			settled = true;
			deadline?.cancel();
			signal?.removeEventListener?.('abort', abort);
			callback(value);
		};
		const rejectWithEvidence = error => finish(reject)(decorateLaunchError(error, evidence));
		const rejectTimeout = (code, message) => {
			const error = decorateLaunchError(Object.assign(new Error(message), { code }), evidence);
			options.onTimeout?.(error);
			finish(reject)(error);
		};
		const abort = () => rejectWithEvidence(abortError(signal?.reason));
		if (signal?.aborted) return abort();
		signal?.addEventListener?.('abort', abort, { once: true });
		deadline = createMainMenuLaunchDeadline(options, {
			onStall: milliseconds => rejectTimeout(
				'WORLD_ENTRY_STALL_TIMEOUT',
				`World entry made no progress for ${milliseconds} ms.`
			),
			onHardTimeout: milliseconds => rejectTimeout(
				'WORLD_ENTRY_HARD_TIMEOUT',
				`World entry exceeded the ${milliseconds} ms hard limit.`
			)
		});
		const observedSelection = observeSelectionProgress(selection, evidence, deadline.progress);
		Promise.resolve()
			.then(() => handler(observedSelection))
			.then(finish(resolve), rejectWithEvidence);
	});
}

function createLaunchEvidence() {
	return { stage: 'world-entry-handler', url: 'unreported' };
}

function observeSelectionProgress(selection = {}, evidence, onProgress) {
	const forward = selection.onProgress;
	return {
		...selection,
		onProgress(detail) {
			if (detail && typeof detail === 'object') {
				if (detail.stage) evidence.stage = String(detail.stage);
				if (detail.url) evidence.url = String(detail.url);
			}
			onProgress?.();
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
	return Object.assign(new Error('World entry was cancelled.'), { name: 'AbortError' });
}
