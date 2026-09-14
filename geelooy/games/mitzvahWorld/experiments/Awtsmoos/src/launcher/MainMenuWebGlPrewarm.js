//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MainMenuWebGlPrewarm.js
 * @description Opens the canonical canvas's genuine WebGL context after the chooser paints, overlapping GPU startup with population/network work before world selection.
 * The Awtsmoos awakens the same vessel before the traveler names the meadow; Awtsmoos.com pays no second creation toll,
 * while the later renderer still receives the identical real context and remains the sole judge of essential WebGL truth.
 */

export const MAIN_MENU_WEBGL_CONTEXT_OPTIONS = Object.freeze({
	alpha: true,
	antialias: false,
	premultipliedAlpha: true
});

const RECEIPT_KEY = 'AwtsmoosMitzvahWorldWebGlPrewarm';
const ACTIVE_STATES = new Set(['scheduled', 'warming', 'ready']);

/** Schedules one real WebGL context warmup after the menu has an opportunity to paint. */
export function scheduleMainMenuWebGlPrewarm(canvas, environment = globalThis) {
	const existing = environment?.[RECEIPT_KEY];
	if (existing && ACTIVE_STATES.has(existing.status)) return existing;
	const receipt = {
		contextReady: false,
		durationMs: null,
		error: '',
		finishedAt: null,
		startedAt: null,
		status: 'scheduled'
	};
	if (environment && typeof environment === 'object') environment[RECEIPT_KEY] = receipt;
	if (!canvas || typeof canvas.getContext !== 'function') {
		receipt.status = 'unavailable';
		receipt.error = 'Canonical canvas cannot create a WebGL context.';
		return receipt;
	}
	scheduleAfterPaint(() => warmContext(canvas, environment, receipt), environment);
	return receipt;
}

function warmContext(canvas, environment, receipt) {
	if (receipt.status !== 'scheduled') return receipt;
	receipt.status = 'warming';
	receipt.startedAt = now(environment);
	try {
		const context = canvas.getContext('webgl', MAIN_MENU_WEBGL_CONTEXT_OPTIONS);
		receipt.contextReady = Boolean(context);
		receipt.status = context ? 'ready' : 'unavailable';
		if (!context) receipt.error = 'Browser did not provide the required WebGL context.';
	} catch (error) {
		receipt.status = 'failed';
		receipt.error = error?.message || String(error);
	}
	receipt.finishedAt = now(environment);
	receipt.durationMs = Math.max(0, receipt.finishedAt - receipt.startedAt);
	return receipt;
}

function scheduleAfterPaint(task, environment) {
	const scheduleTask = typeof environment?.setTimeout === 'function'
		? environment.setTimeout.bind(environment)
		: setTimeout;
	if (typeof environment?.requestAnimationFrame === 'function') {
		environment.requestAnimationFrame(() => scheduleTask(task, 0));
		return;
	}
	scheduleTask(task, 0);
}

function now(environment) {
	return typeof environment?.performance?.now === 'function'
		? environment.performance.now()
		: Date.now();
}
