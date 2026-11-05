//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldBootStateMachine.js
 * @description Owns the one boot truth behind bootStage, runtimeState, and the visible veil.
 * The Awtsmoos speaks one word while many ears receive it; Awtsmoos.com therefore lets every surface —
 * the boot stage attribute, the runtime state attributes, and the blocking loader veil — derive from a
 * single transition table, so ready can never be reported while starting or failed, and failed is terminal.
 */

const MACHINE_KEY = 'AwtsmoosMitzvahWorldBootStateInternal';
const ROOT_ID = 'mitzvah-world-root';
const VEIL_ID = 'menuBoot';

const TRANSITIONS = Object.freeze({
	'starting': Object.freeze(['detecting-webgl', 'painting', 'failed']),
	'detecting-webgl': Object.freeze(['starting', 'painting', 'renderer-creating', 'failed']),
	'painting': Object.freeze(['renderer-creating', 'launcher-loading', 'failed', 'starting']),
	'renderer-creating': Object.freeze(['first-frame-painting', 'failed', 'starting']),
	'first-frame-painting': Object.freeze(['launcher-loading', 'world-loading', 'failed', 'starting']),
	'launcher-loading': Object.freeze(['launching', 'failed', 'starting']),
	'launching': Object.freeze(['world-loading', 'failed', 'starting']),
	'world-loading': Object.freeze(['ready', 'failed', 'starting']),
	'ready': Object.freeze([]),
	'failed': Object.freeze([])
});

/** Returns the current machine state without mutating anything. */
export function readMitzvahWorldBootState(environment = globalThis) {
	const record = environment?.[MACHINE_KEY];
	if (record && typeof record === 'object' && typeof record.state === 'string') {
		return Object.freeze({ ...record, evidence: record.evidence ? { ...record.evidence } : null });
	}
	return Object.freeze({ state: 'starting', evidence: null, updatedAtMs: 0 });
}

/**
 * Moves the machine to the next state and publishes bootStage, runtimeState, and veil from it.
 * Illegal transitions are refused (never throwing): ready can never be reached while starting or failed.
 * @param {object} [environment=globalThis] Environment owning the machine.
 * @param {Document} [documentValue] Document carrying the game root and veil.
 * @param {string} next Requested state.
 * @param {object} [evidence] Failure or readiness evidence for the failed/ready states.
 * @returns {string} The resulting state.
 */
export function transitionMitzvahWorldBootState(environment = globalThis, documentValue = null, next, evidence = null) {
	const record = ensureRecord(environment);
	const current = record.state;
	const requested = String(next || 'starting');
	if (requested === current) {
		publish(record, documentValue || environment?.document);
		return current;
	}
	const allowed = TRANSITIONS[current] || [];
	if (!allowed.includes(requested)) {
		refusedTransition(current, requested, evidence);
		if (!record.published) publish(record, documentValue || environment?.document);
		return current;
	}
	record.state = requested;
	record.evidence = evidence ? Object.freeze({ ...evidence }) : null;
	record.updatedAtMs = readTime(environment);
	publish(record, documentValue || environment?.document);
	return requested;
}

/** Restarts the machine to starting from any state except ready (explicit world relaunch/retry). */
export function restartMitzvahWorldBootState(environment = globalThis, documentValue = null) {
	const record = ensureRecord(environment);
	if (record.state === 'ready') return record.state;
	if (record.state === 'failed') {
		record.state = 'starting';
		record.evidence = null;
		record.updatedAtMs = readTime(environment);
		publish(record, documentValue || environment?.document);
		return 'starting';
	}
	return transitionMitzvahWorldBootState(environment, documentValue, 'starting', null);
}

/** Re-publishes the current state's veil without transitioning (loading screen re-block). */
export function ensureMitzvahWorldBootVeil(environment = globalThis, documentValue = null) {
	const record = ensureRecord(environment);
	publish(record, documentValue || environment?.document);
	return record.state;
}

/** Derives the public runtime state from the single machine state. */
export function deriveMitzvahWorldRuntimeState(state) {
	if (state === 'ready') return 'playable';
	if (state === 'failed') return 'failed';
	return 'starting';
}

function ensureRecord(environment) {
	if (!environment) return { state: 'starting', evidence: null, updatedAtMs: 0 };
	let record = environment[MACHINE_KEY];
	if (!record || typeof record !== 'object') {
		record = { state: 'starting', evidence: null, updatedAtMs: readTime(environment) };
		try {
			Object.defineProperty(environment, MACHINE_KEY, {
				configurable: true,
				enumerable: false,
				value: record,
				writable: false
			});
		} catch {
			environment[MACHINE_KEY] = record;
		}
	}
	return record;
}

/** Publishes the machine state onto every historical surface at once. */
function publish(record, documentValue) {
	record.published = true;
	const state = record.state;
	const runtimeState = deriveMitzvahWorldRuntimeState(state);
	const root = documentValue?.getElementById?.(ROOT_ID) || null;
	const documentRoot = documentValue?.documentElement || null;
	for (const target of [documentRoot, root]) {
		if (!target?.dataset) continue;
		target.dataset.awtsmoosRuntime = runtimeState;
		target.dataset.awtsmoosRuntimeState = runtimeState;
		target.dataset.awtsmoosGameplay = state === 'ready' ? 'true' : 'false';
		if (state === 'failed') {
			target.dataset.awtsmoosRuntimeError = record.evidence?.message || String(record.evidence?.code || 'failed');
		} else {
			target.dataset.awtsmoosRuntimeError = '';
		}
		try {
			target.setAttribute('aria-busy', runtimeState === 'starting' ? 'true' : 'false');
		} catch {}
	}
	if (root?.dataset) {
		root.dataset.awtsmoosBootStage = state;
		if (state === 'ready') {
			root.dataset.awtsmoosMenuReady = 'true';
		} else {
			delete root.dataset.awtsmoosMenuReady;
		}
	}
	publishVeil(record, documentValue);
	try {
		if (typeof globalThis !== 'undefined') {
			globalThis.AwtsmoosMitzvahWorldBootState = Object.freeze({
				evidence: record.evidence,
				runtimeState,
				state,
				updatedAtMs: record.updatedAtMs
			});
		}
	} catch {}
}

/** Keeps the blocking veil visible in every state except ready. */
function publishVeil(record, documentValue) {
	const veil = documentValue?.getElementById?.(VEIL_ID) || null;
	if (!veil) return;
	const ready = record.state === 'ready';
	try {
		veil.hidden = ready;
		veil.setAttribute('aria-hidden', ready ? 'true' : 'false');
		veil.setAttribute('aria-busy', ready ? 'false' : 'true');
		if (ready) veil.dataset.loadingComplete = 'true';
		else delete veil.dataset.loadingComplete;
	} catch {}
}

function refusedTransition(current, requested, evidence) {
	try {
		globalThis.console?.warn?.(
			`B"H MitzvahWorld boot state refused: ${current} -> ${requested}.`,
			evidence?.code || ''
		);
	} catch {}
}

function readTime(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
