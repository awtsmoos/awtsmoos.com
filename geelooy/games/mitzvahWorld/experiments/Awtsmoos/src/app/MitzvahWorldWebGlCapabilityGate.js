//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldWebGlCapabilityGate.js
 * @description Probes genuine WebGL capability before the first-frame silence clock may begin.
 * The Awtsmoos tests the vessel before measuring its silence; Awtsmoos.com therefore learns whether
 * any three-dimensional doorway exists at all before any milestone timer starts counting, so a missing
 * GPU fails fast with its own name instead of masquerading as a slow first frame.
 */

export const WEBGL_UNAVAILABLE_CODE = 'WEBGL_UNAVAILABLE';
const CONTEXT_ATTEMPTS = Object.freeze(['webgl', 'experimental-webgl']);
const CAPABILITY_KEY = 'AwtsmoosMitzvahWorldWebGlCapability';

/**
 * Synchronously probes WebGL on a scratch canvas and releases the probe context.
 * Safe to run before the essential ledger exists; never throws.
 * Returns a tri-state: supported true (context obtained), false (DOM present but no
 * context — fail closed), or null (no DOM to probe, e.g. tests — do not gate).
 * @param {object} [environment=globalThis] Browser-like environment.
 * @returns {object} Frozen capability evidence with a stable failure code.
 */
export function probeMitzvahWorldWebGlCapability(environment = globalThis) {
	const detectedAtMs = readTime(environment);
	const document = environment?.document;
	if (!document || typeof document.createElement !== 'function') {
		return unknown('no-document', detectedAtMs, environment);
	}
	let canvas = null;
	try {
		canvas = document.createElement('canvas');
	} catch (error) {
		return unknown('canvas-unavailable', detectedAtMs, environment);
	}
	if (!canvas || typeof canvas.getContext !== 'function') {
		return unknown('canvas-unavailable', detectedAtMs, environment);
	}
	let context = null;
	let contextName = null;
	let lastError = null;
	for (const attempt of CONTEXT_ATTEMPTS) {
		try {
			context = canvas.getContext(attempt, {
				alpha: true,
				antialias: false,
				premultipliedAlpha: true
			});
		} catch (error) {
			lastError = error;
			context = null;
		}
		if (context) {
			contextName = attempt;
			break;
		}
	}
	const elapsedMs = readTime(environment) - detectedAtMs;
	if (!context) {
		return unsupported('context-unavailable', detectedAtMs, environment, lastError, elapsedMs);
	}
	releaseProbeContext(context);
	return Object.freeze({
		code: 'WEBGL_AVAILABLE',
		contextAttempts: [...CONTEXT_ATTEMPTS],
		contextName,
		detectedAtMs,
		devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
		elapsedMs,
		message: `WebGL capability confirmed (${contextName}).`,
		supported: true
	});
}

/** Remembers probe evidence so later stages never pay for a second probe context. */
export function rememberMitzvahWorldWebGlCapability(environment = globalThis, evidence) {
	if (!environment || !evidence) return evidence;
	try {
		Object.defineProperty(environment, CAPABILITY_KEY, {
			configurable: true,
			enumerable: false,
			value: Object.freeze({ ...evidence }),
			writable: false
		});
	} catch {
		environment[CAPABILITY_KEY] = Object.freeze({ ...evidence });
	}
	return environment[CAPABILITY_KEY];
}

/** Returns remembered probe evidence or null when no probe has run yet. */
export function readMitzvahWorldWebGlCapability(environment = globalThis) {
	const evidence = environment?.[CAPABILITY_KEY];
	return evidence && typeof evidence === 'object' ? evidence : null;
}

/** Releases the scratch probe context so it never consumes a browser context slot. */
function releaseProbeContext(context) {
	try {
		context.getExtension?.('WEBGL_lose_context')?.loseContext();
	} catch {}
}

function unsupported(reason, detectedAtMs, environment, error, elapsedMs = 0) {
	return Object.freeze({
		code: WEBGL_UNAVAILABLE_CODE,
		contextAttempts: [...CONTEXT_ATTEMPTS],
		contextName: null,
		detectedAtMs,
		devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
		elapsedMs,
		errorName: error?.name || 'ContextUnavailable',
		message: 'Mitzvah World requires WebGL to play.',
		reason,
		supported: false
	});
}

/** No DOM exists to probe (tests, workers): capability is unknown, never a failure. */
function unknown(reason, detectedAtMs, environment) {
	return Object.freeze({
		code: 'WEBGL_UNKNOWN',
		contextAttempts: [...CONTEXT_ATTEMPTS],
		contextName: null,
		detectedAtMs,
		devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
		elapsedMs: 0,
		errorName: null,
		message: 'WebGL capability could not be probed in this environment.',
		reason,
		supported: null
	});
}

function readTime(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
