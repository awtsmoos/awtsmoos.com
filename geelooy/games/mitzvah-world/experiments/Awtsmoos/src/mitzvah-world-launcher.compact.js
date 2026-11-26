//B"H

const __awtsmoosLiveImport = (resolve, name) => {
	const callable = function(...args) {
		const value = resolve()[name];
		if (new.target) return Reflect.construct(value, args, new.target);
		return Reflect.apply(value, this, args);
	};
	return new Proxy(callable, {
		apply(_target, thisArg, args) { return Reflect.apply(resolve()[name], thisArg, args); },
		construct(_target, args, newTarget) { return Reflect.construct(resolve()[name], args, newTarget); },
		get(_target, property) { const value = resolve()[name]; return value?.[property]; },
		set(_target, property, value) { const current = resolve()[name]; current[property] = value; return true; },
		has(_target, property) { const current = resolve()[name]; return property in current; },
		ownKeys() { return Reflect.ownKeys(resolve()[name]); }
	});
};
const __awtsmoosLiveNamespace = (resolve) => new Proxy(Object.create(null), {
	get(_target, property) { return resolve()[property]; },
	set(_target, property, value) { resolve()[property] = value; return true; },
	has(_target, property) { return property in resolve(); },
	ownKeys() { return Reflect.ownKeys(resolve()); },
	getOwnPropertyDescriptor(_target, property) {
		const descriptor = Object.getOwnPropertyDescriptor(resolve(), property);
		return descriptor ? { ...descriptor, configurable: true } : undefined;
	}
});

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/BootPromiseRegistry.js ----
{
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootPromiseRegistry.js
	 * @description Owns the single retryable production boot promise.
	 * The Awtsmoos renews one doorway, not a crowd in disguise;
	 * Awtsmoos.com keeps one living promise while failed gates may rise.
	 */

	const BOOT_PROMISE_KEY = 'AwtsmoosMitzvahWorldPageBoot';

	/**
	 * Returns the active boot promise or creates it exactly once.
	 * A rejected promise is removed so a repaired route may try again.
	 *
	 * @param {() => Promise<unknown>} start Creates the production boot.
	 * @param {object} environment Global-like ownership vessel.
	 * @returns {Promise<unknown>} The singular active boot promise.
	 */
	function ensureMitzvahWorldBoot(start, environment = globalThis) {
		const existing = environment[BOOT_PROMISE_KEY];
		if (existing && typeof existing.then === 'function') return existing;
		const promise = Promise.resolve().then(start);
		environment[BOOT_PROMISE_KEY] = promise;
		promise.catch(() => {
			if (environment[BOOT_PROMISE_KEY] === promise) {
				delete environment[BOOT_PROMISE_KEY];
			}
		});
		return promise;
	}


	__exports.ensureMitzvahWorldBoot = ensureMitzvahWorldBoot;
	function activeMitzvahWorldBoot(environment = globalThis) {
		return environment[BOOT_PROMISE_KEY] || null;
	}

	__exports.activeMitzvahWorldBoot = activeMitzvahWorldBoot;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/BinahMitzvahWorldHostRegistry.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BinahMitzvahWorldHostRegistry.js
	 * @description Defines and validates the stable DOM host contract required by the Mitzvah World launcher.
	 * The Awtsmoos knows every vessel before the vessel knows its name; Awtsmoos.com lets Binah make those finite names explicit and testable,
	 * so boot orchestration receives a complete host map instead of repeatedly searching the page through hidden assumptions.
	 */

	const HOST_IDS_BINAH = Object.freeze({
		actionHost: 'actions',
		canvas: 'AwtsmoosCanvas',
		dialogueHost: 'npcDialogue',
		hud: 'hud',
		inventoryHost: 'inventory',
		joystickHost: 'joy',
		jumpHost: 'jump',
		npcHost: 'npcTarget',
		root: 'mitzvah-world-root'
	});

	/** Resolves the immutable host vocabulary into a validated object map. */
	class BinahMitzvahWorldHostRegistry {
		/** @param {Document} [documentKli=globalThis.document] Active Mitzvah World document. */
		constructor(documentKli = globalThis.document) {
			this.document = documentKli;
		}

		/**
		 * Resolves every required launcher host or fails immediately with the exact missing selector.
		 * @returns {Readonly<object>} Frozen semantic host map.
		 */
		resolve() {
			const hostsYesod = {};
			for (const [nameDaas, idMalchus] of Object.entries(HOST_IDS_BINAH)) {
				const hostKli = this.document?.getElementById?.(idMalchus);
				if (!hostKli) {
					throw new Error(`Missing Mitzvah World host: #${idMalchus}`);
				}
				hostsYesod[nameDaas] = hostKli;
			}
			return Object.freeze(hostsYesod);
		}
	}

	__exports.BinahMitzvahWorldHostRegistry = BinahMitzvahWorldHostRegistry;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldReleaseIdentity.js ----
{
	const __exports = __awtsmoosModule_6;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldReleaseIdentity.js
	 * @description Holds one immutable release covenant for readable source, generated CompactJS, and essential first-play assets.
	 * The Awtsmoos renews source, bundle, and garment in one present decree; Awtsmoos.com gives every playable-meadow vessel
	 * the same finite name, so stale code cannot masquerade as the freshly grounded world that eye and foot agree to see.
	 */

	const MITZVAH_WORLD_RELEASE_ID = '20261126-mitzvah-world-loadfix-01';

	__exports.MITZVAH_WORLD_RELEASE_ID = MITZVAH_WORLD_RELEASE_ID;
	const MITZVAH_WORLD_SOURCE_VERSION = MITZVAH_WORLD_RELEASE_ID;

	__exports.MITZVAH_WORLD_SOURCE_VERSION = MITZVAH_WORLD_SOURCE_VERSION;
	const MITZVAH_WORLD_BUNDLE_VERSION = MITZVAH_WORLD_RELEASE_ID;


	__exports.MITZVAH_WORLD_BUNDLE_VERSION = MITZVAH_WORLD_BUNDLE_VERSION;
	const MITZVAH_WORLD_RELEASE_VERSIONS = Object.freeze({
		bundleVersion: MITZVAH_WORLD_BUNDLE_VERSION,
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		sourceVersion: MITZVAH_WORLD_SOURCE_VERSION
	});


	__exports.MITZVAH_WORLD_RELEASE_VERSIONS = MITZVAH_WORLD_RELEASE_VERSIONS;
	/** Creates an immutable release receipt for browser proofs and visible failure reports. */
	function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
		return Object.freeze({
			...MITZVAH_WORLD_RELEASE_VERSIONS,
			stage,
			...details
		});
	}

	__exports.createMitzvahWorldReleaseReceipt = createMitzvahWorldReleaseReceipt;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldFailureReceipt.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldFailureReceipt.js
	 * @description Converts startup fractures into one release-aware evidence receipt for loader, HUD, tests, and diagnostics.
	 * The Awtsmoos recreates even a broken finite road and therefore permits its exact edge to be named;
	 * Awtsmoos.com records vessel, context, milestone, resource, release, and elapsed time so no failure hides framed.
	 */

	const MITZVAH_WORLD_RELEASE_VERSIONS = __awtsmoosModule_6.MITZVAH_WORLD_RELEASE_VERSIONS;

	const NOT_PLAYABLE_PREFIX = 'MINIMAL_MEADOW_NOT_PLAYABLE:';

	/** Produces one immutable normalized startup failure receipt with first-frame evidence when available. */
	function createMitzvahWorldFailureReceipt(errorOhr) {
		const error = errorOhr instanceof Error ? errorOhr : new Error(String(errorOhr));
		const message = error.message || String(errorOhr);
		const viewportEvidence = error.viewportEvidence || error.cause?.viewportEvidence || null;
		return Object.freeze({
			...MITZVAH_WORLD_RELEASE_VERSIONS,
			canvasDimensions: viewportEvidence ? Object.freeze({
				clientHeight: viewportEvidence.clientHeight,
				clientWidth: viewportEvidence.clientWidth,
				rectHeight: viewportEvidence.rectHeight,
				rectWidth: viewportEvidence.rectWidth
			}) : null,
			code: error.code || failureCode(message),
			contextCreationResult: error.contextCreationResult || 'unknown',
			detail: error.detail || '',
			elapsedMs: finiteOrNull(error.elapsedMs),
			failedResource: findFailedUrl(error),
			message,
			milestone: error.currentMilestone || error.milestone || error.stage || 'startup',
			stage: error.stage || 'startup',
			unmetConditions: Object.freeze(extractUnmetConditions(message)),
			viewportEvidence
		});
	}


	__exports.createMitzvahWorldFailureReceipt = createMitzvahWorldFailureReceipt;
	/** Formats finite evidence shown to players and copied into diagnostics. */
	function formatMitzvahWorldFailureReceipt(receipt) {
		const conditions = receipt.unmetConditions?.length
			? receipt.unmetConditions.join(', ')
			: receipt.code || 'unknown-startup-condition';
		const canvas = receipt.canvasDimensions
			? `${receipt.canvasDimensions.clientWidth}x${receipt.canvasDimensions.clientHeight}`
			: 'not measured';
		return [
			`Unmet: ${conditions}`,
			`Milestone: ${receipt.milestone}`,
			`Canvas: ${canvas}`,
			`Context: ${receipt.contextCreationResult}`,
			`Resource: ${receipt.failedResource || 'not reported'}`,
			`Elapsed: ${receipt.elapsedMs ?? 'unknown'} ms`,
			`Release: ${receipt.releaseId}`,
			`Source: ${receipt.sourceVersion} · Bundle: ${receipt.bundleVersion}`
		].join('\n');
	}


	__exports.formatMitzvahWorldFailureReceipt = formatMitzvahWorldFailureReceipt;
	function extractUnmetConditions(message) {
		if (!message.startsWith(NOT_PLAYABLE_PREFIX)) return [];
		return message.slice(NOT_PLAYABLE_PREFIX.length)
			.split(',')
			.map(value => value.trim())
			.filter(Boolean);
	}

	function failureCode(message) {
		return message.startsWith(NOT_PLAYABLE_PREFIX)
			? 'MITZVAH_WORLD_NOT_PLAYABLE'
			: 'MITZVAH_WORLD_STARTUP_FAILED';
	}

	function findFailedUrl(error) {
		for (const key of ['failedUrl', 'url', 'requestUrl', 'resourceUrl']) {
			if (typeof error?.[key] === 'string' && error[key]) return error[key];
		}
		const cause = error?.cause;
		for (const key of ['failedUrl', 'url', 'requestUrl', 'resourceUrl']) {
			if (typeof cause?.[key] === 'string' && cause[key]) return cause[key];
		}
		return '';
	}

	function finiteOrNull(value) {
		const number = Number(value);
		return Number.isFinite(number) ? number : null;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldBootStateMachine.js ----
{
	const __exports = __awtsmoosModule_8;
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
	function readMitzvahWorldBootState(environment = globalThis) {
		const record = environment?.[MACHINE_KEY];
		if (record && typeof record === 'object' && typeof record.state === 'string') {
			return Object.freeze({ ...record, evidence: record.evidence ? { ...record.evidence } : null });
		}
		return Object.freeze({ state: 'starting', evidence: null, updatedAtMs: 0 });
	}


	__exports.readMitzvahWorldBootState = readMitzvahWorldBootState;
	/**
	 * Moves the machine to the next state and publishes bootStage, runtimeState, and veil from it.
	 * Illegal transitions are refused (never throwing): ready can never be reached while starting or failed.
	 * @param {object} [environment=globalThis] Environment owning the machine.
	 * @param {Document} [documentValue] Document carrying the game root and veil.
	 * @param {string} next Requested state.
	 * @param {object} [evidence] Failure or readiness evidence for the failed/ready states.
	 * @returns {string} The resulting state.
	 */
	function transitionMitzvahWorldBootState(environment = globalThis, documentValue = null, next, evidence = null) {
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


	__exports.transitionMitzvahWorldBootState = transitionMitzvahWorldBootState;
	/** Restarts the machine to starting from any state except ready (explicit world relaunch/retry). */
	function restartMitzvahWorldBootState(environment = globalThis, documentValue = null) {
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


	__exports.restartMitzvahWorldBootState = restartMitzvahWorldBootState;
	/** Re-publishes the current state's veil without transitioning (loading screen re-block). */
	function ensureMitzvahWorldBootVeil(environment = globalThis, documentValue = null) {
		const record = ensureRecord(environment);
		publish(record, documentValue || environment?.document);
		return record.state;
	}


	__exports.ensureMitzvahWorldBootVeil = ensureMitzvahWorldBootVeil;
	/** Derives the public runtime state from the single machine state. */
	function deriveMitzvahWorldRuntimeState(state) {
		if (state === 'ready') return 'playable';
		if (state === 'failed') return 'failed';
		return 'starting';
	}


	__exports.deriveMitzvahWorldRuntimeState = deriveMitzvahWorldRuntimeState;
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

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MalchusMitzvahWorldRootState.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MalchusMitzvahWorldRootState.js
	 * @description Owns Mitzvah World's presentation-state attributes and busy state on the game root instead of leaking visual state onto the document element.
	 * The Awtsmoos, Atzmus beyond state and transition, recreates every apparent before and after as one living truth;
	 * Awtsmoos.com lets Malchus hold only this world's visible signals, so CSS and accessibility share one local state while deeper systems stay free of global roots.
	 */

	const transitionMitzvahWorldBootState = __awtsmoosModule_8.transitionMitzvahWorldBootState;

	const ROOT_ID = 'mitzvah-world-root';
	const FLAG_NAMES_BINAH = Object.freeze({
		advancedControls: 'awtsmoosAdvancedControls',
		cinematic: 'awtsmoosCinematic',
		menuReady: 'awtsmoosMenuReady'
	});
	const BOOT_STAGE_STATES = Object.freeze({
		failed: 'failed',
		fatal: 'failed',
		'launcher-loading': 'launcher-loading',
		launching: 'launching',
		painting: 'painting',
		ready: 'ready',
		starting: 'starting'
	});

	/** Owns the small, explicit dataset contract consumed by localized Mitzvah World presentation. */
	class MalchusMitzvahWorldRootState {
		/**
		 * Resolves the canonical game root once and refuses to silently target `<html>` as a fallback.
		 * @param {Document} [documentKli=globalThis.document] Active Mitzvah World document.
		 */
		constructor(documentKli = globalThis.document) {
			this.document = documentKli;
			this.root = documentKli?.getElementById?.(ROOT_ID) || null;
			if (!this.root) {
				throw new Error(`MITZVAH_WORLD_ROOT_MISSING:#${ROOT_ID}`);
			}
		}

		/**
		 * Publishes one boot phase through the single boot state machine, which keeps
		 * bootStage, runtimeState, and the visible veil derived from one transition table.
		 * @param {string} stageOhr Canonical boot stage such as starting, painting, launching, ready, or failed.
		 * @returns {string} Stored normalized stage.
		 */
		setBootStage(stageOhr) {
			const stageMalchus = String(stageOhr || 'starting');
			const state = BOOT_STAGE_STATES[stageMalchus];
			if (!state) {
				throw new RangeError(`MITZVAH_WORLD_BOOT_STAGE_UNKNOWN:${stageMalchus}`);
			}
			const environment = this.document?.defaultView || globalThis;
			transitionMitzvahWorldBootState(environment, this.document, state, null);
			return stageMalchus;
		}

		/**
		 * Sets or removes one approved boolean presentation flag without accepting arbitrary dataset keys.
		 * @param {'advancedControls'|'cinematic'|'menuReady'} nameBinah Approved semantic flag name.
		 * @param {boolean} activeOhr Desired state.
		 * @returns {boolean} Normalized stored state.
		 */
		setFlag(nameBinah, activeOhr) {
			const dataNameYesod = FLAG_NAMES_BINAH[nameBinah];
			if (!dataNameYesod) {
				throw new RangeError(`MITZVAH_WORLD_ROOT_FLAG_UNKNOWN:${nameBinah}`);
			}
			if (activeOhr) {
				this.root.dataset[dataNameYesod] = 'true';
			} else {
				delete this.root.dataset[dataNameYesod];
			}
			return Boolean(activeOhr);
		}

		/** @returns {boolean} Whether one approved root-local presentation flag is active. */
		readFlag(nameBinah) {
			const dataNameYesod = FLAG_NAMES_BINAH[nameBinah];
			if (!dataNameYesod) {
				throw new RangeError(`MITZVAH_WORLD_ROOT_FLAG_UNKNOWN:${nameBinah}`);
			}
			return this.root.dataset[dataNameYesod] === 'true';
		}
	}

	__exports.MalchusMitzvahWorldRootState = MalchusMitzvahWorldRootState;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/GevurahMitzvahWorldFailureBoundary.js ----
{
	const __exports = __awtsmoosModule_4;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file GevurahMitzvahWorldFailureBoundary.js
	 * @description Installs one page-level failure witness and renders structured startup truth inside the localized Mitzvah World HUD.
	 * The Awtsmoos is not hidden by failure; every broken finite path is recreated and therefore can be named clearly;
	 * Awtsmoos.com lets Gevurah show condition, URL, and release covenant instead of scattering console-only darkness yearly.
	 */

	const createMitzvahWorldFailureReceipt = __awtsmoosModule_5.createMitzvahWorldFailureReceipt;
	const formatMitzvahWorldFailureReceipt = __awtsmoosModule_5.formatMitzvahWorldFailureReceipt;
	const MalchusMitzvahWorldRootState = __awtsmoosModule_7.MalchusMitzvahWorldRootState;

	const FAILURE_LISTENER_KEY = 'AwtsmoosMitzvahWorldFailureListeners';

	/** Owns one durable global error-listener installation while visible failure state remains game-local. */
	class GevurahMitzvahWorldFailureBoundary {
		constructor(hudMalchus, documentKli, environmentKli = globalThis) {
			this.hud = hudMalchus;
			this.environment = environmentKli;
			this.rootState = new MalchusMitzvahWorldRootState(documentKli);
		}

		/** Installs window-level error witnesses once per environment without duplicating listeners on retry. */
		install() {
			if (this.environment[FAILURE_LISTENER_KEY]) return;
			this.environment[FAILURE_LISTENER_KEY] = true;
			this.environment.addEventListener?.('error', eventOhr => {
				this.show(eventOhr.error || eventOhr.message);
			});
			this.environment.addEventListener?.('unhandledrejection', eventOhr => {
				this.show(eventOhr.reason);
			});
		}

		/** Publishes one exact failure receipt while preserving the original stack separately for diagnostics. */
		show(errorOhr) {
			const receipt = createMitzvahWorldFailureReceipt(errorOhr);
			const formatted = formatMitzvahWorldFailureReceipt(receipt);
			this.rootState.setBootStage('failed');
			this.hud.textContent = `B"H startup failed\n${formatted}`;
			this.hud.dataset.bootFailure = JSON.stringify(receipt);
			this.hud.dataset.bootFailureStack = errorOhr?.stack || receipt.message;
			console.error(errorOhr);
			return receipt;
		}
	}

	__exports.GevurahMitzvahWorldFailureBoundary = GevurahMitzvahWorldFailureBoundary;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldStartupMilestones.js ----
{
	const __exports = __awtsmoosModule_10;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldStartupMilestones.js
	 * @description Records one-shot monotonic startup milestones and adopts the compact launcher's scalar first-light seed.
	 * The Awtsmoos renews each instant beyond measure while Awtsmoos.com remembers the first revealed ray;
	 * deferred richness inherits that origin faithfully, so later clocks can deepen truth without rewriting the day.
	 */

	const LEDGERS_BY_ENVIRONMENT = new WeakMap();
	const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';

	/** Owns immutable first-observation timing for one runtime environment. */
	class MitzvahWorldStartupMilestones {
		constructor({ environment = globalThis, clock = resolveClock(environment) } = {}) {
			this.environment = objectEnvironment(environment);
			this.clock = clock;
			this.originMilliseconds = null;
			this.records = new Map();
			this.adoptCompactSeed();
		}

		/** Records a milestone once and republishes a frozen diagnostic snapshot. */
		mark(name) {
			const key = String(name || '').trim();
			if (!key) return null;
			const existing = this.records.get(key);
			if (existing) return existing;
			const atMilliseconds = finiteNow(this.clock());
			this.originMilliseconds ??= atMilliseconds;
			const record = Object.freeze({
				name: key,
				atMilliseconds,
				elapsedMilliseconds: Math.max(0, atMilliseconds - this.originMilliseconds)
			});
			this.records.set(key, record);
			this.publish();
			return record;
		}

		/** Returns a value snapshot suitable for browser automation and cold-load receipts. */
		snapshot() {
			return Object.freeze({
				originMilliseconds: this.originMilliseconds,
				milestones: Object.freeze(Object.fromEntries(this.records))
			});
		}

		publish() {
			const snapshot = this.snapshot();
			try {
				this.environment.AwtsmoosMitzvahWorldStartup = snapshot;
			} catch {}
			return snapshot;
		}

		/** Converts the first-control scalar into the richer immutable scriptStart record. */
		adoptCompactSeed() {
			const atMilliseconds = finiteOrNull(this.environment?.[SCRIPT_START_KEY]);
			if (atMilliseconds === null) return;
			this.originMilliseconds = atMilliseconds;
			this.records.set('scriptStart', Object.freeze({
				name: 'scriptStart',
				atMilliseconds,
				elapsedMilliseconds: 0
			}));
		}
	}


	__exports.MitzvahWorldStartupMilestones = MitzvahWorldStartupMilestones;
	/** Records one named startup milestone against the environment's shared ledger. */
	function markMitzvahWorldStartupMilestone(environment, name) {
		return startupMilestonesFor(environment).mark(name);
	}


	__exports.markMitzvahWorldStartupMilestone = markMitzvahWorldStartupMilestone;
	/** Returns the latest immutable startup receipt for one environment. */
	function getMitzvahWorldStartupSnapshot(environment = globalThis) {
		return startupMilestonesFor(environment).snapshot();
	}


	__exports.getMitzvahWorldStartupSnapshot = getMitzvahWorldStartupSnapshot;
	/** Resolves the shared ledger without creating parallel clocks for one browser environment. */
	function startupMilestonesFor(environment = globalThis) {
		const vessel = objectEnvironment(environment);
		let ledger = LEDGERS_BY_ENVIRONMENT.get(vessel);
		if (!ledger) {
			ledger = new MitzvahWorldStartupMilestones({ environment: vessel });
			LEDGERS_BY_ENVIRONMENT.set(vessel, ledger);
		}
		return ledger;
	}


	__exports.startupMilestonesFor = startupMilestonesFor;
	function objectEnvironment(environment) {
		return environment && (typeof environment === 'object' || typeof environment === 'function')
			? environment
			: globalThis;
	}

	function resolveClock(environment) {
		const performanceClock = environment?.performance;
		return typeof performanceClock?.now === 'function'
			? () => performanceClock.now()
			: () => Date.now();
	}

	function finiteOrNull(value) {
		return Number.isFinite(Number(value)) ? Number(value) : null;
	}

	function finiteNow(value) {
		return finiteOrNull(value) ?? 0;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialMilestoneCatalog.js ----
{
	const __exports = __awtsmoosModule_15;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialMilestoneCatalog.js
	 * @description Declares the five facts that alone may open first play and the finite silence/hard horizons that guard them.
	 * The Awtsmoos renews each fact from nothing; Awtsmoos.com measures silence rather than punishing a slower vessel
	 * that is still revealing truthful progress, while one outer horizon keeps first play bounded.
	 * Each milestone carries its own stage-specific deadline instead of one fixed wait: local work (entry,
	 * renderer context, terrain, movement) must land in seconds, while the authored Chossid GLB keeps a longer
	 * network-honest horizon. Terrain and the Chossid are launch-gated: only a world launch can produce them,
	 * so at their deadlines a registered witness may testify about the launch — in flight, or not yet requested.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = 30000;

	__exports.ESSENTIAL_BOOT_TIMEOUT_MS = ESSENTIAL_BOOT_TIMEOUT_MS;
	const ESSENTIAL_HARD_TIMEOUT_MS = 90000;


	__exports.ESSENTIAL_HARD_TIMEOUT_MS = ESSENTIAL_HARD_TIMEOUT_MS;
	const ENTRY_DEADLINE_MS = 10000;

	__exports.ENTRY_DEADLINE_MS = ENTRY_DEADLINE_MS;
	const RENDERER_FIRST_FRAME_DEADLINE_MS = 15000;

	__exports.RENDERER_FIRST_FRAME_DEADLINE_MS = RENDERER_FIRST_FRAME_DEADLINE_MS;
	const SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS = 60000;

	__exports.SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS = SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS;
	const SPAWN_TERRAIN_DEADLINE_MS = 15000;

	__exports.SPAWN_TERRAIN_DEADLINE_MS = SPAWN_TERRAIN_DEADLINE_MS;
	const CANONICAL_CHOSSID_DEADLINE_MS = 30000;

	__exports.CANONICAL_CHOSSID_DEADLINE_MS = CANONICAL_CHOSSID_DEADLINE_MS;
	const PLAYER_MOVEMENT_DEADLINE_MS = 10000;


	__exports.PLAYER_MOVEMENT_DEADLINE_MS = PLAYER_MOVEMENT_DEADLINE_MS;
	const ESSENTIAL_MILESTONES = Object.freeze({
		ENTRY_MODULE_EXECUTED: 'entryModuleExecuted',
		RENDERER_FIRST_FRAME: 'rendererFirstFrame',
		SPAWN_TERRAIN_EXISTS: 'spawnTerrainExists',
		CANONICAL_CHOSSID_DECODED: 'canonicalChossidDecoded',
		PLAYER_MOVEMENT_ENABLED: 'playerMovementEnabled'
	});


	__exports.ESSENTIAL_MILESTONES = ESSENTIAL_MILESTONES;
	const ESSENTIAL_MILESTONE_CATALOG = Object.freeze([
		definition(ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, 'Entry module executed', [], ENTRY_DEADLINE_MS),
		definition(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'Renderer produced first frame', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], RENDERER_FIRST_FRAME_DEADLINE_MS),
		definition(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'Spawn terrain exists', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], SPAWN_TERRAIN_DEADLINE_MS, true),
		definition(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, 'Canonical chossid.glb decoded', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], CANONICAL_CHOSSID_DEADLINE_MS, true),
		definition(
			ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
			'Player movement enabled',
			[
				ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
				ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
				ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
			],
			PLAYER_MOVEMENT_DEADLINE_MS
		)
	]);


	__exports.ESSENTIAL_MILESTONE_CATALOG = ESSENTIAL_MILESTONE_CATALOG;
	/** Creates one immutable milestone covenant. */
	function definition(name, label, dependencies, timeoutMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS, launchGated = false) {
		return Object.freeze({
			dependencies: Object.freeze([...dependencies]),
			label,
			launchGated,
			name,
			timeoutFailureCode: `ESSENTIAL_${toFailureToken(name)}_TIMEOUT`,
			timeoutMilliseconds
		});
	}

	function toFailureToken(name) {
		return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialClock.js ----
{
	const __exports = __awtsmoosModule_14;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialClock.js
	 * @description Keeps essential-boot time and finite watchdog scheduling outside the fact ledger.
	 * The Awtsmoos renews each measured instant; Awtsmoos.com schedules only the next truthful deadline,
	 * never confusing one fixed wall-clock guess with the living progress of a slower browser.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = __awtsmoosModule_15.ESSENTIAL_BOOT_TIMEOUT_MS;

	function scheduleMitzvahWorldEssentialTimeout(environment, callback, delayMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS) {
		const schedule = environment?.setTimeout?.bind(environment) || setTimeout;
		const timer = schedule(callback, Math.max(0, Number(delayMilliseconds) || 0));
		timer?.unref?.();
		return timer;
	}


	__exports.scheduleMitzvahWorldEssentialTimeout = scheduleMitzvahWorldEssentialTimeout;
	function cancelMitzvahWorldEssentialTimeout(environment, timer) {
		if (timer === undefined || timer === null) return;
		(environment?.clearTimeout?.bind(environment) || clearTimeout)(timer);
	}


	__exports.cancelMitzvahWorldEssentialTimeout = cancelMitzvahWorldEssentialTimeout;
	function readMitzvahWorldEssentialTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

	__exports.readMitzvahWorldEssentialTime = readMitzvahWorldEssentialTime;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialRecord.js ----
{
	const __exports = __awtsmoosModule_18;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialRecord.js
	 * @description Builds and reads one essential boot fact while keeping activation time distinct from most recent truthful progress.
	 * The Awtsmoos renews each fact whenever its vessel reveals another threshold; Awtsmoos.com therefore measures silence
	 * from the latest witnessed progress instead of condemning an active mobile load for total wall-clock age.
	 */

	function createEssentialRecord(definition) {
		return {
			...definition,
			completedAtMilliseconds: null,
			elapsedMilliseconds: 0,
			failedAtMilliseconds: null,
			failureCode: null,
			failureMessage: null,
			importerStage: null,
			lastProgressAtMilliseconds: null,
			resourceStatus: null,
			resourceUrl: null,
			startedAtMilliseconds: null,
			status: 'pending'
		};
	}


	__exports.createEssentialRecord = createEssentialRecord;
	function applyEssentialDetails(record, details = {}) {
		if ('importerStage' in details) record.importerStage = details.importerStage ?? null;
		if ('resourceStatus' in details) record.resourceStatus = details.resourceStatus ?? null;
		if ('resourceUrl' in details) record.resourceUrl = details.resourceUrl ?? null;
	}


	__exports.applyEssentialDetails = applyEssentialDetails;
	/** Erases a silence verdict once the genuine proof has completed the fact it named. */
	function clearEssentialFailure(record) {
		record.failureCode = null;
		record.failureMessage = null;
		record.failedAtMilliseconds = null;
	}


	__exports.clearEssentialFailure = clearEssentialFailure;
	function isEssentialTerminal(status) {
		return status === 'complete' || status === 'failed' || status === 'timed-out';
	}


	__exports.isEssentialTerminal = isEssentialTerminal;
	function essentialDependenciesComplete(records, record) {
		return record.dependencies.every(name => records.get(name)?.status === 'complete');
	}

	__exports.essentialDependenciesComplete = essentialDependenciesComplete;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialTiming.js ----
{
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialTiming.js
	 * @description Owns activation and silence-deadline arithmetic for essential first-play facts.
	 * The Awtsmoos renews every dependency only when its vessel can truly receive the next light;
	 * Awtsmoos.com therefore measures each active fact from its latest witnessed progress, never from stale wall-clock memory.
	 */

	const essentialDependenciesComplete = __awtsmoosModule_18.essentialDependenciesComplete;

	function activateReadyEssentialRecords(records, currentTime) {
		const activated = [];
		for (const record of records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds !== null) continue;
			if (!essentialDependenciesComplete(records, record)) continue;
			record.startedAtMilliseconds = currentTime;
			record.lastProgressAtMilliseconds = currentTime;
			activated.push(record.name);
		}
		return activated;
	}


	__exports.activateReadyEssentialRecords = activateReadyEssentialRecords;
	function touchEssentialRecord(record, currentTime) {
		if (record.status !== 'pending' || record.startedAtMilliseconds === null) return false;
		record.lastProgressAtMilliseconds = currentTime;
		return true;
	}


	__exports.touchEssentialRecord = touchEssentialRecord;
	/**
	 * Returns the instant from which a fact's silence is honestly measured: its own latest
	 * progress, or the boot-wide progress floor when the caller supplies one that is later.
	 * Only the first-frame fact receives a floor (see the ledger); every other fact is
	 * judged on its own progress alone, so renderer progress can never hide silent terrain.
	 */
	function essentialEffectiveLastProgress(record, progressFloorMilliseconds = null) {
		const own = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
		if (progressFloorMilliseconds === null || progressFloorMilliseconds === undefined) return own;
		return own === null ? progressFloorMilliseconds : Math.max(own, progressFloorMilliseconds);
	}


	__exports.essentialEffectiveLastProgress = essentialEffectiveLastProgress;
	function essentialRecordTimedOut(record, currentTime, progressFloorMilliseconds = null) {
		if (record.startedAtMilliseconds === null) return false;
		const latest = essentialEffectiveLastProgress(record, progressFloorMilliseconds);
		return currentTime - latest >= record.timeoutMilliseconds;
	}


	__exports.essentialRecordTimedOut = essentialRecordTimedOut;
	function firstTimedOutEssentialRecord(records, currentTime, progressFloorForRecord = null) {
		return [...records.values()].find(record => {
			const floor = typeof progressFloorForRecord === 'function' ? progressFloorForRecord(record) : null;
			return record.status === 'pending' && essentialRecordTimedOut(record, currentTime, floor);
		}) || null;
	}


	__exports.firstTimedOutEssentialRecord = firstTimedOutEssentialRecord;
	function firstActiveEssentialRecord(records) {
		return [...records.values()].find(record => {
			return record.status === 'pending' && record.startedAtMilliseconds !== null;
		}) || null;
	}


	__exports.firstActiveEssentialRecord = firstActiveEssentialRecord;
	function essentialElapsedMilliseconds(record, currentTime) {
		if (record.status !== 'pending') return record.elapsedMilliseconds;
		if (record.startedAtMilliseconds === null) return 0;
		return Math.max(0, currentTime - record.startedAtMilliseconds);
	}

	__exports.essentialElapsedMilliseconds = essentialElapsedMilliseconds;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialDeadlinePolicy.js ----
{
	const __exports = __awtsmoosModule_16;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialDeadlinePolicy.js
	 * @description Names dependency, silence, and whole-first-play timeout failures without owning mutation or timers.
	 * The Awtsmoos gives every bounded delay its truthful name; Awtsmoos.com distinguishes a silent milestone
	 * from the outer hard horizon so diagnostics never confuse local stillness with total first-play exhaustion.
	 */

	const ESSENTIAL_HARD_TIMEOUT_MS = __awtsmoosModule_15.ESSENTIAL_HARD_TIMEOUT_MS;
	const essentialRecordTimedOut = __awtsmoosModule_17.essentialRecordTimedOut;

	const ESSENTIAL_HARD_TIMEOUT_CODE = 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT';


	__exports.ESSENTIAL_HARD_TIMEOUT_CODE = ESSENTIAL_HARD_TIMEOUT_CODE;
	function essentialDependencyFailure(details, missing) {
		return {
			...details,
			failureCode: 'ESSENTIAL_DEPENDENCY_INCOMPLETE',
			failureMessage: `Dependency ${missing} was not complete.`,
			resourceStatus: details.resourceStatus ?? 'dependency-incomplete'
		};
	}


	__exports.essentialDependencyFailure = essentialDependencyFailure;
	function essentialDeadlineFailure(record, currentTime, bootStartedAt, details = {}, progressFloorMilliseconds = null) {
		if (essentialRecordTimedOut(record, currentTime, progressFloorMilliseconds)) {
			return timeoutDetails(record, details, record.timeoutFailureCode, currentTime);
		}
		if (currentTime - bootStartedAt >= ESSENTIAL_HARD_TIMEOUT_MS) {
			return timeoutDetails(record, details, ESSENTIAL_HARD_TIMEOUT_CODE, currentTime);
		}
		return null;
	}


	__exports.essentialDeadlineFailure = essentialDeadlineFailure;
	function timeoutDetails(record, details, failureCode, nowMilliseconds = Date.now()) {
		const startedAt = record.startedAtMilliseconds ?? nowMilliseconds;
		const elapsedMilliseconds = Math.max(0, nowMilliseconds - startedAt);
		return {
			...details,
			elapsedMilliseconds,
			failureCode,
			failureMessage: `${record.label} missed the bounded first-play deadline after ${Math.round(elapsedMilliseconds)} ms ` +
				`(stage: ${details.importerStage || record.importerStage || 'essential-boot'}; ` +
				`deadline: ${record.timeoutMilliseconds} ms).`,
			importerStage: details.importerStage ?? record.importerStage ?? 'essential-boot',
			resourceStatus: details.resourceStatus ?? record.resourceStatus ?? 'stalled-no-progress',
			status: 'timed-out'
		};
	}

	__exports.timeoutDetails = timeoutDetails;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialWatchdog.js ----
{
	const __exports = __awtsmoosModule_21;
	// B"H
	// Boruch Hashem
	// Blessed is He

	const ESSENTIAL_HARD_TIMEOUT_MS = __awtsmoosModule_15.ESSENTIAL_HARD_TIMEOUT_MS;
	const cancelMitzvahWorldEssentialTimeout = __awtsmoosModule_14.cancelMitzvahWorldEssentialTimeout;
	const readMitzvahWorldEssentialTime = __awtsmoosModule_14.readMitzvahWorldEssentialTime;
	const scheduleMitzvahWorldEssentialTimeout = __awtsmoosModule_14.scheduleMitzvahWorldEssentialTimeout;
	const essentialEffectiveLastProgress = __awtsmoosModule_17.essentialEffectiveLastProgress;

	/**
	 * @file MitzvahWorldEssentialWatchdog.js
	 * @description Schedules one timer for the earliest milestone-silence or whole-first-play deadline.
	 * The Awtsmoos gives each active fact its own measured silence while one horizon surrounds them all;
	 * Awtsmoos.com watches whichever truthful boundary arrives first instead of resetting stuck siblings together.
	 */
	class MitzvahWorldEssentialWatchdog {
		constructor(environment, startedAtMilliseconds, onTimeout) {
			this.environment = environment;
			this.startedAtMilliseconds = startedAtMilliseconds;
			this.onTimeout = onTimeout;
			this.timer = null;
		}

		rearm(records, currentTime = readMitzvahWorldEssentialTime(this.environment), progressFloorForRecord = null) {
			this.cancel();
			const delay = nextEssentialWatchdogDelay(records, currentTime, this.startedAtMilliseconds, progressFloorForRecord);
			if (!Number.isFinite(delay)) return null;
			this.timer = scheduleMitzvahWorldEssentialTimeout(this.environment, this.onTimeout, delay);
			return this.timer;
		}

		cancel() {
			cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
			this.timer = null;
		}
	}


	__exports.MitzvahWorldEssentialWatchdog = MitzvahWorldEssentialWatchdog;
	function nextEssentialWatchdogDelay(records, currentTime, startedAtMilliseconds, progressFloorForRecord = null) {
		const remaining = [];
		for (const record of records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds === null) continue;
			const floor = typeof progressFloorForRecord === 'function' ? progressFloorForRecord(record) : null;
			const latest = essentialEffectiveLastProgress(record, floor);
			remaining.push(record.timeoutMilliseconds - (currentTime - latest));
		}
		remaining.push(ESSENTIAL_HARD_TIMEOUT_MS - (currentTime - startedAtMilliseconds));
		return Math.max(0, Math.min(...remaining));
	}


	__exports.nextEssentialWatchdogDelay = nextEssentialWatchdogDelay;
	function essentialHardTimeoutReached(currentTime, startedAtMilliseconds) {
		return currentTime - startedAtMilliseconds >= ESSENTIAL_HARD_TIMEOUT_MS;
	}

	__exports.essentialHardTimeoutReached = essentialHardTimeoutReached;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialLaunchProof.js ----
{
	const __exports = __awtsmoosModule_20;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialLaunchProof.js
	 * @description Lets a launch-gated fact be judged by the launch's own testimony at its silence deadline.
	 * The Awtsmoos does not condemn earth that was never asked to rise; Awtsmoos.com therefore asks, at the
	 * exact deadline of terrain or the Chossid, what is true of the only crossing that can produce them:
	 * a launch in flight inside its own progress law renews the fact with the crossing's witnessed stage,
	 * a living chooser testifies that first play was never requested, and anything else — a settled launch,
	 * an exhausted stall law, a vanished chooser, a throwing or counterfeit witness — leaves the honest
	 * silence verdict standing under its original name. The whole first-play hard horizon seals every
	 * in-flight testimony: no crossing, however lively, testifies past it.
	 */

	const applyEssentialDetails = __awtsmoosModule_18.applyEssentialDetails;
	const touchEssentialRecord = __awtsmoosModule_17.touchEssentialRecord;
	const essentialHardTimeoutReached = __awtsmoosModule_21.essentialHardTimeoutReached;

	/**
	 * Asks the registered launch witness whether a governed world crossing is still in flight.
	 * The testimony is believed only while the crossing's latest truthful progress sits inside its
	 * own stall budget and before the hard horizon; acceptance renews the fact from that evidence
	 * exactly once for this deadline and records the proof in the fact's own diagnostics.
	 * @param {object} ledger Essential ledger whose watchdog reached the deadline.
	 * @param {object} record Overdue launch-gated milestone record under judgement.
	 * @param {number} nowMilliseconds Current essential time.
	 * @returns {boolean} True only when truthful in-flight testimony renewed the fact.
	 */
	function attemptEssentialLaunchProof(ledger, record, nowMilliseconds) {
		if (!record.launchGated || typeof ledger.launchWitness !== 'function') return false;
		if (essentialHardTimeoutReached(nowMilliseconds, ledger.startedAtMilliseconds)) return false;
		const testimony = callWitness(ledger.launchWitness);
		if (!testimony || typeof testimony.importerStage !== 'string' || !testimony.importerStage) return false;
		const progressedAt = testimony.lastProgressAtMilliseconds;
		const stallBudget = testimony.stallBudgetMilliseconds;
		if (!Number.isFinite(progressedAt) || !Number.isFinite(stallBudget) || stallBudget <= 0) return false;
		if (progressedAt < (record.startedAtMilliseconds ?? 0) || progressedAt > nowMilliseconds) return false;
		if (nowMilliseconds - progressedAt > stallBudget) return false;
		acceptTestimony(ledger, record, nowMilliseconds, {
			importerStage: testimony.importerStage,
			resourceStatus: 'launch-in-flight'
		}, 'launchProofCount');
		return true;
	}


	__exports.attemptEssentialLaunchProof = attemptEssentialLaunchProof;
	/**
	 * Asks the registered menu witness whether the world chooser is still the live surface.
	 * Its testimony — first play not yet requested — is the one state in which a launch-gated
	 * fact's silence is not evidence against it, so acceptance renews the fact with the chooser's
	 * stage. With renew false the testimony is only read, never consumed: the hard-horizon
	 * judgement asks whether every still-active fact is covered before it disarms in peace.
	 * @param {object} ledger Essential ledger whose watchdog is judging.
	 * @param {object} record Launch-gated milestone record under judgement.
	 * @param {number} nowMilliseconds Current essential time.
	 * @param {boolean} [renew] Whether acceptance may renew the fact's silence clock.
	 * @returns {boolean} True only when a living chooser truthfully covers the fact.
	 */
	function attemptEssentialMenuProof(ledger, record, nowMilliseconds, renew = true) {
		if (!record.launchGated || typeof ledger.menuWitness !== 'function') return false;
		const testimony = callWitness(ledger.menuWitness);
		if (!testimony || typeof testimony.importerStage !== 'string' || !testimony.importerStage) return false;
		if (!renew) return true;
		acceptTestimony(ledger, record, nowMilliseconds, {
			importerStage: testimony.importerStage,
			resourceStatus: testimony.resourceStatus || 'chooser-live'
		}, 'menuProofCount');
		return true;
	}


	__exports.attemptEssentialMenuProof = attemptEssentialMenuProof;
	/** Invokes a witness defensively: a throwing or empty testimony is no testimony. */
	function callWitness(witness) {
		try {
			const testimony = witness();
			return testimony && typeof testimony === 'object' ? testimony : null;
		} catch {
			return null;
		}
	}

	/** Renews one fact from accepted testimony and rearms the watchdog for its siblings. */
	function acceptTestimony(ledger, record, nowMilliseconds, details, counterField) {
		applyEssentialDetails(record, details);
		touchEssentialRecord(record, nowMilliseconds);
		record[counterField] = (record[counterField] || 0) + 1;
		ledger.rearmWatchdog(nowMilliseconds);
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialFrameProof.js ----
{
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialFrameProof.js
	 * @description Resolves an essential watchdog deadline: first the active proofs, then the honest failure.
	 * The Awtsmoos does not merely watch for light; Awtsmoos.com, at the exact deadline of a covenant,
	 * asks for the guarded reality itself — the first-frame vessel must produce one genuine frame, and a
	 * launch-gated fact must be covered by its launch's truthful testimony (a crossing in flight, or a
	 * chooser still awaiting the player's word) — so whatever can honestly testify passes, while a vessel
	 * that produces nothing still fails by name, and the whole first-play hard horizon seals the rest.
	 */

	const ESSENTIAL_HARD_TIMEOUT_CODE = __awtsmoosModule_16.ESSENTIAL_HARD_TIMEOUT_CODE;
	const timeoutDetails = __awtsmoosModule_16.timeoutDetails;
	const attemptEssentialLaunchProof = __awtsmoosModule_20.attemptEssentialLaunchProof;
	const attemptEssentialMenuProof = __awtsmoosModule_20.attemptEssentialMenuProof;
	const ESSENTIAL_MILESTONES = __awtsmoosModule_15.ESSENTIAL_MILESTONES;
	const firstTimedOutEssentialRecord = __awtsmoosModule_17.firstTimedOutEssentialRecord;
	const touchEssentialRecord = __awtsmoosModule_17.touchEssentialRecord;
	const essentialHardTimeoutReached = __awtsmoosModule_21.essentialHardTimeoutReached;

	/**
	 * Settles one watchdog firing for the ledger: an overdue fact first receives its active proof
	 * attempts (frame proof for the first-frame fact, launch/menu testimony for launch-gated facts);
	 * failing those, the silence is named exactly as before, and the whole first-play hard horizon
	 * still bounds every active sibling that no living chooser honestly covers.
	 * @param {object} ledger Essential ledger whose watchdog fired.
	 * @param {number} nowMilliseconds Current essential time.
	 * @returns {object} The ledger's published snapshot after the settlement.
	 */
	function resolveEssentialWatchdogTimeout(ledger, nowMilliseconds) {
		const overdue = firstTimedOutEssentialRecord(ledger.records, nowMilliseconds, record => ledger.progressFloorFor(record));
		if (overdue) {
			if (attemptEssentialFrameProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
			if (attemptEssentialLaunchProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
			if (attemptEssentialMenuProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
			return ledger.fail(overdue.name, timeoutDetails(overdue, {}, overdue.timeoutFailureCode, nowMilliseconds));
		}
		if (essentialHardTimeoutReached(nowMilliseconds, ledger.startedAtMilliseconds)) {
			const exposed = firstExposedEssentialRecord(ledger, nowMilliseconds);
			if (exposed) return ledger.fail(exposed.name, timeoutDetails(exposed, {}, ESSENTIAL_HARD_TIMEOUT_CODE, nowMilliseconds));
			ledger.cancelWatchdog();
			return ledger.publish();
		}
		ledger.rearmWatchdog(nowMilliseconds);
		return ledger.publish();
	}


	__exports.resolveEssentialWatchdogTimeout = resolveEssentialWatchdogTimeout;
	/**
	 * Finds the first still-active fact the hard horizon may honestly condemn: one no living
	 * chooser covers. When every active fact is launch-gated and menu-covered — the chooser
	 * idling past the horizon with first play never requested — there is nothing to condemn,
	 * and the caller disarms instead of naming a failure that never began.
	 * @param {object} ledger Essential ledger under hard-horizon judgement.
	 * @param {number} nowMilliseconds Current essential time.
	 * @returns {object|null} The first exposed active record, or null when all are covered.
	 */
	function firstExposedEssentialRecord(ledger, nowMilliseconds) {
		for (const record of ledger.records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds === null) continue;
			if (attemptEssentialMenuProof(ledger, record, nowMilliseconds, false)) continue;
			return record;
		}
		return null;
	}

	/**
	 * Makes the single permitted active attempt when the first-frame fact reaches its deadline.
	 * The prover is invoked synchronously and at most once per ledger; it must return truthful
	 * completion evidence (the milestone details of a frame it truly produced) or nothing.
	 * A throwing, empty, or counterfeit attempt leaves the honest timeout failure untouched.
	 * @param {object} ledger Essential ledger whose watchdog reached the deadline.
	 * @param {object} record Overdue milestone record under judgement.
	 * @param {number} nowMilliseconds Current essential time.
	 * @returns {boolean} True only when the proof genuinely completed the first-frame fact.
	 */
	function attemptEssentialFrameProof(ledger, record, nowMilliseconds) {
		if (record.name !== ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME) return false;
		if (typeof ledger.frameProver !== 'function' || ledger.frameProofAttempted) return false;
		ledger.frameProofAttempted = true;
		let receipt = null;
		try {
			receipt = ledger.frameProver();
		} catch {
			receipt = null;
		}
		if (!receipt || typeof receipt !== 'object') return false;
		touchEssentialRecord(record, nowMilliseconds);
		ledger.complete(record.name, receipt);
		return record.status === 'complete';
	}

	__exports.attemptEssentialFrameProof = attemptEssentialFrameProof;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialFailurePresenter.js ----
{
	const __exports = __awtsmoosModule_22;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialFailurePresenter.js
	 * @description Makes a stalled essential milestone visible without involving optional world hydration.
	 * The Awtsmoos turns hidden failure into useful speech; Awtsmoos.com lets Gevurah name the blocked gate clearly so the next repair can begin brightly.
	 */

	const FAILURE_ID = 'mitzvah-world-essential-failure';

	/**
	 * Presents one actionable essential-boot failure when a document is available.
	 * @param {object} environment Browser-like runtime vessel.
	 * @param {object} milestone Frozen failed milestone receipt.
	 */
	function presentMitzvahWorldEssentialFailure(environment, milestone) {
		const document = environment?.document;
		if (!document?.body || !milestone) {
			return;
		}
		const panel = document.getElementById(FAILURE_ID) || createPanel(document);
		panel.textContent = '';
		const message = document.createElement('div');
		message.textContent = failureMessage(milestone);
		panel.appendChild(message);
		if (milestone.failureMessage) {
			const plain = document.createElement('div');
			plain.textContent = milestone.failureMessage;
			panel.appendChild(plain);
		}
		const retry = document.createElement('button');
		retry.type = 'button';
		retry.textContent = 'Try again';
		retry.style.cssText = 'margin-top:8px;padding:6px 12px;border-radius:8px;border:1px solid #ffb4a8;background:#2a1212;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer';
		retry.addEventListener('click', () => environment.location?.reload?.());
		panel.appendChild(retry);
	}


	__exports.presentMitzvahWorldEssentialFailure = presentMitzvahWorldEssentialFailure;
	/** Creates the small failure vessel only when proof actually fails. */
	function createPanel(document) {
		const panel = document.createElement('div');
		panel.id = FAILURE_ID;
		panel.setAttribute('role', 'alert');
		panel.style.cssText = [
			'position:fixed',
			'left:12px',
			'right:12px',
			'top:12px',
			'z-index:2147483647',
			'padding:12px 14px',
			'background:#180b0b',
			'color:#fff',
			'font:600 13px/1.4 system-ui,sans-serif',
			'border:1px solid #ffb4a8',
			'border-radius:10px'
		].join(';');
		document.body.appendChild(panel);
		return panel;
	}

	/** Formats the exact stalled fact and its strongest available resource evidence. */
	function failureMessage(milestone) {
		const url = milestone.resourceUrl || 'no resource URL';
		const stage = milestone.importerStage || 'runtime';
		const status = milestone.resourceStatus ?? 'unknown status';
		const detail = `${milestone.failureCode}; ${Math.round(milestone.elapsedMilliseconds)} ms; ${url}; ${status}; ${stage}.`;
		if (milestone.failureCode === 'CANONICAL_CHOSSID_GLB_LOAD_FAILED') {
			return `The Chossid model (chossid.glb) could not be loaded, so the world cannot start yet. ${detail}`;
		}
		return `Essential boot failed: ${milestone.label}. ${detail}`;
	}

	/**
	 * Dismisses a previously presented essential-boot failure, e.g. when a world-launch
	 * restart opens a fresh gate after an honest menu-idle timeout.
	 * @param {object} environment Browser-like runtime vessel.
	 */
	function dismissMitzvahWorldEssentialFailure(environment) {
		const panel = environment?.document?.getElementById?.(FAILURE_ID);
		if (panel?.remove) {
			panel.remove();
		}
	}

	__exports.dismissMitzvahWorldEssentialFailure = dismissMitzvahWorldEssentialFailure;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialSnapshot.js ----
{
	const __exports = __awtsmoosModule_23;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialSnapshot.js
	 * @description Freezes essential boot truth while preserving the difference between queued time and active measured time.
	 * The Awtsmoos renews each hidden dependency before its clock may honestly begin;
	 * Awtsmoos.com shows queued facts at zero, active facts aging, and terminal facts sealed where their evidence has been.
	 */

	const essentialElapsedMilliseconds = __awtsmoosModule_17.essentialElapsedMilliseconds;
	const firstActiveEssentialRecord = __awtsmoosModule_17.firstActiveEssentialRecord;

	/** Builds one immutable public receipt from the internal milestone map. */
	function createMitzvahWorldEssentialSnapshot(records, startedAtMilliseconds, environment, graphicsEvidence = {}) {
		const currentTime = now(environment);
		const milestones = freezeMilestones(records, currentTime);
		const active = firstActiveEssentialRecord(records);
		return Object.freeze({
			activeMilestone: active ? milestones[active.name] : null,
			certified: Object.values(milestones).every(record => record.status === 'complete'),
			milestones,
			softwareRenderer: graphicsEvidence.softwareRenderer === true,
			startedAtMilliseconds,
			stalledMilestone: findStalledMilestone(milestones)
		});
	}


	__exports.createMitzvahWorldEssentialSnapshot = createMitzvahWorldEssentialSnapshot;
	/** Copies records into a frozen public map with truthful live elapsed evidence. */
	function freezeMilestones(records, currentTime) {
		return Object.freeze(Object.fromEntries(
			[...records].map(([name, record]) => [
				name,
				Object.freeze({
					...record,
					elapsedMilliseconds: essentialElapsedMilliseconds(record, currentTime)
				})
			])
		));
	}

	/** Reserves stalled milestone for a witnessed failure or deadline timeout. */
	function findStalledMilestone(milestones) {
		return Object.values(milestones).find(record => {
			return record.status === 'failed' || record.status === 'timed-out';
		}) || null;
	}

	/** Uses the browser monotonic clock when available. */
	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialSlowGraphicsNotice.js ----
{
	const __exports = __awtsmoosModule_24;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialSlowGraphicsNotice.js
	 * @description Shows one calm still-loading notice when a software rasterizer is honestly mid-boot.
	 * The Awtsmoos does not call slowness failure while light is still arriving; Awtsmoos.com therefore
	 * tells the player the truth in plain words — slow graphics detected, still loading, this many of the
	 * five first-play facts already proved — and removes the notice the moment the boot certifies or a
	 * genuine failure must speak instead. The notice never appears for GPU boots, never before a world
	 * or movie launch has begun the gate, and never beside the red failure panel.
	 */

	const ESSENTIAL_MILESTONES = __awtsmoosModule_15.ESSENTIAL_MILESTONES;

	const NOTICE_ID = 'mitzvah-world-essential-slow-graphics';

	/**
	 * Reconciles the notice with the newest published snapshot. Called on every ledger
	 * publish; a pure DOM reflection of snapshot truth, safe without a document.
	 */
	function syncMitzvahWorldEssentialSlowGraphicsNotice(environment, snapshot, context = {}) {
		const document = environment?.document;
		if (!document?.body || !snapshot) return;
		if (!slowGraphicsNoticeApplies(snapshot, context)) {
			dismissMitzvahWorldEssentialSlowGraphicsNotice(environment);
			return;
		}
		const panel = document.getElementById(NOTICE_ID) || createNoticePanel(document);
		const text = slowGraphicsNoticeText(snapshot);
		if (panel.textContent !== text) panel.textContent = text;
	}


	__exports.syncMitzvahWorldEssentialSlowGraphicsNotice = syncMitzvahWorldEssentialSlowGraphicsNotice;
	/** Removes the notice when boot leaves the slow-but-progressing state. */
	function dismissMitzvahWorldEssentialSlowGraphicsNotice(environment) {
		const panel = environment?.document?.getElementById?.(NOTICE_ID);
		if (panel?.remove) panel.remove();
	}


	__exports.dismissMitzvahWorldEssentialSlowGraphicsNotice = dismissMitzvahWorldEssentialSlowGraphicsNotice;
	function slowGraphicsNoticeApplies(snapshot, context) {
		if (context.softwareRenderer !== true || context.launchBegun !== true) return false;
		if (snapshot.certified || snapshot.stalledMilestone) return false;
		const firstFrame = snapshot.milestones?.[ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME];
		return firstFrame?.status === 'pending' && firstFrame?.startedAtMilliseconds !== null;
	}

	function slowGraphicsNoticeText(snapshot) {
		const milestones = Object.values(snapshot.milestones || {});
		const proved = milestones.filter(milestone => milestone.status === 'complete').length;
		return `Slow graphics detected — still loading… ${proved} of ${milestones.length} first-play milestones proved. ` +
			'Software rendering can take a minute; the world is still on its way.';
	}

	function createNoticePanel(document) {
		const panel = document.createElement('section');
		panel.id = NOTICE_ID;
		panel.setAttribute('role', 'status');
		panel.style.cssText = 'position:fixed;z-index:2147483000;top:16px;left:50%;transform:translateX(-50%);' +
			'max-width:min(560px,calc(100vw - 32px));padding:12px 16px;border:1px solid #7fb4c7;border-radius:12px;' +
			'background:#0c1622;color:#eaf6ff;font:500 14px/1.5 system-ui,sans-serif;box-shadow:0 12px 32px #0008;';
		document.body.append(panel);
		return panel;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldWebGlCapabilityGate.js ----
{
	const __exports = __awtsmoosModule_25;
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

	const WEBGL_UNAVAILABLE_CODE = 'WEBGL_UNAVAILABLE';

	__exports.WEBGL_UNAVAILABLE_CODE = WEBGL_UNAVAILABLE_CODE;
	const CONTEXT_ATTEMPTS = Object.freeze(['webgl', 'experimental-webgl']);
	const CAPABILITY_KEY = 'AwtsmoosMitzvahWorldWebGlCapability';
	const SOFTWARE_RENDERER_PATTERN = /swiftshader|llvmpipe|softpipe|software rasterizer|basic render driver/i;

	/**
	 * Synchronously probes WebGL on a scratch canvas and releases the probe context.
	 * Safe to run before the essential ledger exists; never throws.
	 * Returns a tri-state: supported true (context obtained), false (DOM present but no
	 * context — fail closed), or null (no DOM to probe, e.g. tests — do not gate).
	 * @param {object} [environment=globalThis] Browser-like environment.
	 * @returns {object} Frozen capability evidence with a stable failure code.
	 */
	function probeMitzvahWorldWebGlCapability(environment = globalThis) {
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
		const rendererEvidence = readRendererEvidence(context);
		releaseProbeContext(context);
		return Object.freeze({
			code: 'WEBGL_AVAILABLE',
			contextAttempts: [...CONTEXT_ATTEMPTS],
			contextName,
			detectedAtMs,
			devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
			elapsedMs,
			message: `WebGL capability confirmed (${contextName}).`,
			renderer: rendererEvidence.renderer,
			softwareRenderer: rendererEvidence.softwareRenderer,
			supported: true
		});
	}


	__exports.probeMitzvahWorldWebGlCapability = probeMitzvahWorldWebGlCapability;
	/**
	 * Reads the renderer's self-reported name from the live probe context and classifies
	 * software rasterizers. Prefers the unmasked debug name; falls back to the standard
	 * RENDERER parameter. Never throws: an unreadable name is honest absence, not failure.
	 */
	function readRendererEvidence(context) {
		let renderer = null;
		try {
			const extension = context.getExtension?.('WEBGL_debug_renderer_info');
			if (extension) {
				renderer = context.getParameter?.(extension.UNMASKED_RENDERER_WEBGL) ?? null;
			}
		} catch {}
		if (!renderer) {
			try {
				renderer = context.getParameter?.(context.RENDERER) ?? null;
			} catch {}
		}
		const name = typeof renderer === 'string' && renderer ? renderer : null;
		return {
			renderer: name,
			softwareRenderer: name ? SOFTWARE_RENDERER_PATTERN.test(name) : false
		};
	}

	/** Remembers probe evidence so later stages never pay for a second probe context. */
	function rememberMitzvahWorldWebGlCapability(environment = globalThis, evidence) {
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


	__exports.rememberMitzvahWorldWebGlCapability = rememberMitzvahWorldWebGlCapability;
	/** Returns remembered probe evidence or null when no probe has run yet. */
	function readMitzvahWorldWebGlCapability(environment = globalThis) {
		const evidence = environment?.[CAPABILITY_KEY];
		return evidence && typeof evidence === 'object' ? evidence : null;
	}


	__exports.readMitzvahWorldWebGlCapability = readMitzvahWorldWebGlCapability;
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
			renderer: null,
			softwareRenderer: false,
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
			renderer: null,
			softwareRenderer: false,
			supported: null
		});
	}

	function readTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialLedger.js ----
{
	const __exports = __awtsmoosModule_13;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialLedger.js
	 * @description Owns five essential facts while one watchdog observes each fact's silence and the whole horizon.
	 * The Awtsmoos joins dependency to dependency without mistaking revelation for delay; Awtsmoos.com refreshes only
	 * the fact that truly progressed while every silent sibling keeps its own finite night. A silence timeout names missing
	 * evidence, never a broken vessel: the real proof may still arrive late, and witnesses may testify at a deadline.
	 */

	const readMitzvahWorldEssentialTime = __awtsmoosModule_14.readMitzvahWorldEssentialTime;
	const ESSENTIAL_HARD_TIMEOUT_CODE = __awtsmoosModule_16.ESSENTIAL_HARD_TIMEOUT_CODE;
	const essentialDeadlineFailure = __awtsmoosModule_16.essentialDeadlineFailure;
	const essentialDependencyFailure = __awtsmoosModule_16.essentialDependencyFailure;
	const ESSENTIAL_MILESTONES = __awtsmoosModule_15.ESSENTIAL_MILESTONES;
	const ESSENTIAL_MILESTONE_CATALOG = __awtsmoosModule_15.ESSENTIAL_MILESTONE_CATALOG;
	const SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS = __awtsmoosModule_15.SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS;
	const resolveEssentialWatchdogTimeout = __awtsmoosModule_19.resolveEssentialWatchdogTimeout;
	const dismissMitzvahWorldEssentialFailure = __awtsmoosModule_22.dismissMitzvahWorldEssentialFailure;
	const presentMitzvahWorldEssentialFailure = __awtsmoosModule_22.presentMitzvahWorldEssentialFailure;
	const applyEssentialDetails = __awtsmoosModule_18.applyEssentialDetails;
	const clearEssentialFailure = __awtsmoosModule_18.clearEssentialFailure;
	const createEssentialRecord = __awtsmoosModule_18.createEssentialRecord;
	const isEssentialTerminal = __awtsmoosModule_18.isEssentialTerminal;
	const createMitzvahWorldEssentialSnapshot = __awtsmoosModule_23.createMitzvahWorldEssentialSnapshot;
	const syncMitzvahWorldEssentialSlowGraphicsNotice = __awtsmoosModule_24.syncMitzvahWorldEssentialSlowGraphicsNotice;
	const readMitzvahWorldWebGlCapability = __awtsmoosModule_25.readMitzvahWorldWebGlCapability;
	const activateReadyEssentialRecords = __awtsmoosModule_17.activateReadyEssentialRecords;
	const touchEssentialRecord = __awtsmoosModule_17.touchEssentialRecord;
	const MitzvahWorldEssentialWatchdog = __awtsmoosModule_21.MitzvahWorldEssentialWatchdog;

	class MitzvahWorldEssentialLedger {
		constructor(environment) {
			this.environment = environment;
			this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
			this.lastProgressAtMilliseconds = this.startedAtMilliseconds;
			this.firstPlayLaunchBegun = false;
			this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, createEssentialRecord(item)]));
			this.launchWitness = this.menuWitness = null;
			this.softwareRenderer = readMitzvahWorldWebGlCapability(environment)?.softwareRenderer === true;
			if (this.softwareRenderer) {
				const firstFrame = this.records.get(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
				if (firstFrame) firstFrame.timeoutMilliseconds = SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS;
			}
			this.frameProver = null;
			this.frameProofAttempted = false;
			activateReadyEssentialRecords(this.records, this.startedAtMilliseconds);
			this.watchdog = new MitzvahWorldEssentialWatchdog(environment, this.startedAtMilliseconds, () => this.timeout());
			this.rearmWatchdog(this.startedAtMilliseconds);
			this.publish();
		}

		update(name, details = {}) {
			const record = this.requireRecord(name);
			if (!isEssentialTerminal(record.status)) {
				const now = readMitzvahWorldEssentialTime(this.environment);
				applyEssentialDetails(record, details);
				touchEssentialRecord(record, now);
				this.lastProgressAtMilliseconds = now;
				this.rearmWatchdog(now);
			}
			return this.publish();
		}

		complete(name, details = {}) {
			const record = this.requireRecord(name);
			const reviving = record.status === 'timed-out' && record.failureCode !== ESSENTIAL_HARD_TIMEOUT_CODE;
			if (isEssentialTerminal(record.status) && !reviving) return this.snapshot();
			const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
			if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
			const now = readMitzvahWorldEssentialTime(this.environment);
			if (!reviving) {
				const failure = essentialDeadlineFailure(record, now, this.startedAtMilliseconds, details, this.progressFloorFor(record));
				if (failure) return this.fail(name, failure);
			}
			applyEssentialDetails(record, details);
			record.lastProgressAtMilliseconds = now;
			this.lastProgressAtMilliseconds = now;
			record.status = 'complete';
			record.completedAtMilliseconds = now;
			record.elapsedMilliseconds = now - record.startedAtMilliseconds;
			if (reviving) clearEssentialFailure(record);
			activateReadyEssentialRecords(this.records, now);
			this.rearmWatchdog(now);
			const snapshot = this.publish();
			if (reviving && !snapshot.stalledMilestone) dismissMitzvahWorldEssentialFailure(this.environment);
			return snapshot;
		}

		fail(name, details = {}) {
			const record = this.requireRecord(name);
			if (isEssentialTerminal(record.status)) return this.snapshot();
			const now = readMitzvahWorldEssentialTime(this.environment);
			if (!details.resourceUrl) {
				let donor = null;
				for (const candidate of this.records.values()) {
					if (candidate === record || !candidate.resourceUrl) continue;
					const progress = candidate.lastProgressAtMilliseconds ?? candidate.startedAtMilliseconds ?? -1;
					if (!donor || progress > donor.progress) donor = { candidate, progress };
				}
				if (donor) {
					details = {
						...details,
						resourceStatus: details.resourceStatus ?? donor.candidate.resourceStatus ?? null,
						resourceUrl: donor.candidate.resourceUrl
					};
					if ((details.importerStage == null || details.importerStage === 'essential-boot')
						&& record.importerStage == null && donor.candidate.importerStage != null) {
						details = { ...details, importerStage: donor.candidate.importerStage };
					}
				}
			}
			applyEssentialDetails(record, details);
			record.status = details.status || 'failed';
			record.failureCode = details.failureCode || 'ESSENTIAL_BOOT_FAILURE';
			record.failureMessage = details.failureMessage || null;
			record.failedAtMilliseconds = now;
			record.elapsedMilliseconds = now - (record.startedAtMilliseconds ?? this.startedAtMilliseconds);
			this.cancelWatchdog();
			const snapshot = this.publish();
			presentMitzvahWorldEssentialFailure(this.environment, snapshot.stalledMilestone);
			return snapshot;
		}

		timeout() {
			return resolveEssentialWatchdogTimeout(this, readMitzvahWorldEssentialTime(this.environment));
		}

		cancelWatchdog() {
			this.watchdog?.cancel();
			this.timer = null;
		}

		publish() {
			const snapshot = this.snapshot();
			this.environment.AwtsmoosMitzvahWorldEssentialBoot = snapshot;
			syncMitzvahWorldEssentialSlowGraphicsNotice(this.environment, snapshot, {
				launchBegun: this.firstPlayLaunchBegun === true,
				softwareRenderer: this.softwareRenderer
			});
			return snapshot;
		}

		snapshot() {
			return createMitzvahWorldEssentialSnapshot(this.records, this.startedAtMilliseconds, this.environment, {
				softwareRenderer: this.softwareRenderer
			});
		}

		/**
		 * The first-frame fact alone is judged against boot-wide progress: any witnessed
		 * update or completion anywhere in the ledger proves the boot is still alive.
		 * Every other fact returns null and keeps its own strict per-fact silence.
		 */
		progressFloorFor(record) {
			return record.name === ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME
				? this.lastProgressAtMilliseconds
				: null;
		}

		requireRecord(name) {
			const record = this.records.get(name);
			if (!record) throw new Error(`Unknown essential Mitzvah World milestone: ${name}`);
			return record;
		}

		rearmWatchdog(now) {
			if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) return this.cancelWatchdog();
			this.timer = this.watchdog.rearm(this.records, now, record => this.progressFloorFor(record));
		}
	}

	__exports.MitzvahWorldEssentialLedger = MitzvahWorldEssentialLedger;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldBootMilestones.js ----
{
	const __exports = __awtsmoosModule_26;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldBootMilestones.js
	 * @description Records the seven Chapter 4 boot milestones separately: navigation, entry import,
	 * renderer-ready, first frame, terrain-ready, Chossid-ready, and movement-ready.
	 * The Awtsmoos gives first control seven honest marks; Awtsmoos.com keeps each milestone on one
	 * shared clock so ten cold and ten warm loads can prove one release and one boot path.
	 * State lives on globalThis so every compiled bundle copy reads and writes the same registry.
	 */

	const BOOT_MILESTONE_NAMES = Object.freeze([
		'navigation',
		'entryImport',
		'rendererReady',
		'firstFrame',
		'terrainReady',
		'chossidReady',
		'movementReady'
	]);


	__exports.BOOT_MILESTONE_NAMES = BOOT_MILESTONE_NAMES;
	/** Maps the five essential milestone names onto the seven boot milestone names. */
	const ESSENTIAL_TO_BOOT_MILESTONE = Object.freeze({
		entryModuleExecuted: 'entryImport',
		rendererFirstFrame: 'firstFrame',
		spawnTerrainExists: 'terrainReady',
		canonicalChossidDecoded: 'chossidReady',
		playerMovementEnabled: 'movementReady'
	});


	__exports.ESSENTIAL_TO_BOOT_MILESTONE = ESSENTIAL_TO_BOOT_MILESTONE;
	const REGISTRY_KEY = 'AwtsmoosMitzvahWorldBootMilestones';
	const RECEIPT_KEY = 'AwtsmoosMitzvahWorldBootMilestonesReceipt';

	/** Returns the shared milestone registry, creating it when absent. */
	function bootMilestoneRegistry(environment = globalThis) {
		if (!environment || typeof environment !== 'object') return {};
		if (!environment[REGISTRY_KEY] || typeof environment[REGISTRY_KEY] !== 'object') {
			environment[REGISTRY_KEY] = {};
		}
		return environment[REGISTRY_KEY];
	}


	__exports.bootMilestoneRegistry = bootMilestoneRegistry;
	/** Returns milliseconds since the navigation time origin, or null when unavailable. */
	function bootMilestoneNow(environment = globalThis) {
		const value = typeof environment?.performance?.now === 'function'
			? environment.performance.now()
			: Date.now();
		return Number.isFinite(Number(value)) ? Number(value) : null;
	}


	__exports.bootMilestoneNow = bootMilestoneNow;
	/**
	 * Records one boot milestone at the current clock. Keeps the earliest timestamp when a
	 * milestone is recorded twice, so a restart cannot move a milestone later than its first truth.
	 */
	function recordBootMilestone(name, detail = null, environment = globalThis) {
		if (!BOOT_MILESTONE_NAMES.includes(name)) {
			throw new Error(`UNKNOWN_BOOT_MILESTONE:${name}`);
		}
		const registry = bootMilestoneRegistry(environment);
		const elapsedMs = bootMilestoneNow(environment);
		if (elapsedMs == null) return null;
		const existing = registry[name];
		if (existing && existing.elapsedMs <= elapsedMs) return existing;
		const record = Object.freeze({
			detail: detail == null ? null : detail,
			elapsedMs,
			name,
			status: 'complete'
		});
		registry[name] = record;
		return record;
	}


	__exports.recordBootMilestone = recordBootMilestone;
	/** Records the navigation milestone from the Navigation Timing entry when available. */
	function recordNavigationMilestone(environment = globalThis) {
		const registry = bootMilestoneRegistry(environment);
		if (registry.navigation) return registry.navigation;
		let entry = null;
		try {
			entry = environment?.performance?.getEntriesByType?.('navigation')?.[0] || null;
		} catch {}
		const elapsedMs = entry && Number.isFinite(Number(entry.responseEnd))
			? Number(entry.responseEnd)
			: bootMilestoneNow(environment);
		if (elapsedMs == null) return null;
		const detail = entry ? Object.freeze({
			domContentLoadedEventEnd: Number.isFinite(Number(entry.domContentLoadedEventEnd)) ? Number(entry.domContentLoadedEventEnd) : null,
			fetchStart: Number.isFinite(Number(entry.fetchStart)) ? Number(entry.fetchStart) : null,
			responseEnd: Number(entry.responseEnd),
			transferSize: Number.isFinite(Number(entry.transferSize)) ? Number(entry.transferSize) : null
		}) : null;
		const record = Object.freeze({
			detail,
			elapsedMs,
			name: 'navigation',
			status: 'complete'
		});
		registry.navigation = record;
		return record;
	}


	__exports.recordNavigationMilestone = recordNavigationMilestone;
	/** Records one essential milestone under its Chapter 4 boot milestone name. */
	function recordEssentialBootMilestone(essentialName, detail = null, environment = globalThis) {
		const bootName = ESSENTIAL_TO_BOOT_MILESTONE[essentialName];
		if (!bootName) return null;
		return recordBootMilestone(bootName, detail, environment);
	}


	__exports.recordEssentialBootMilestone = recordEssentialBootMilestone;
	/**
	 * Publishes one frozen receipt with all seven milestones and the release ID when known.
	 * Missing milestones are listed as pending, never invented.
	 */
	function publishBootMilestonesReceipt(environment = globalThis) {
		const registry = bootMilestoneRegistry(environment);
		const milestones = {};
		for (const name of BOOT_MILESTONE_NAMES) {
			milestones[name] = registry[name] || Object.freeze({
				detail: null,
				elapsedMs: null,
				name,
				status: 'pending'
			});
		}
		const releaseId = readReleaseId(environment);
		const receipt = Object.freeze({
			milestones: Object.freeze(milestones),
			recordedAtMs: bootMilestoneNow(environment),
			releaseId
		});
		environment[RECEIPT_KEY] = receipt;
		return receipt;
	}


	__exports.publishBootMilestonesReceipt = publishBootMilestonesReceipt;
	/** Returns the published boot milestones receipt when one exists, otherwise null. */
	function readBootMilestonesReceipt(environment = globalThis) {
		return environment?.[RECEIPT_KEY] || null;
	}


	__exports.readBootMilestonesReceipt = readBootMilestonesReceipt;
	/** Reads the release ID from the HTML meta tag when present. */
	function readReleaseId(environment = globalThis) {
		try {
			const meta = environment?.document?.querySelector?.('meta[name="mitzvah-world-release"]');
			const content = meta?.getAttribute?.('content');
			return typeof content === 'string' && content.length > 0 ? content : null;
		} catch {
			return null;
		}
	}

	__exports.readReleaseId = readReleaseId;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldEssentialBoot.js ----
{
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialBoot.js
	 * @description Publishes one environment-owned essential ledger across source modules and independently compiled runtime chunks.
	 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com lets the five facts testify into one shared Malchus whose silence clocks renew with real progress, whose witnesses testify at deadlines, and whose outer first-play horizon stays finite.
	 */

	const MitzvahWorldEssentialLedger = __awtsmoosModule_13.MitzvahWorldEssentialLedger;
	const dismissMitzvahWorldEssentialFailure = __awtsmoosModule_22.dismissMitzvahWorldEssentialFailure;
	const CATALOG_MILESTONES = __awtsmoosModule_15.ESSENTIAL_MILESTONES;
	const recordEssentialBootMilestone = __awtsmoosModule_26.recordEssentialBootMilestone;
	const probeMitzvahWorldWebGlCapability = __awtsmoosModule_25.probeMitzvahWorldWebGlCapability;
	const readMitzvahWorldWebGlCapability = __awtsmoosModule_25.readMitzvahWorldWebGlCapability;
	const rememberMitzvahWorldWebGlCapability = __awtsmoosModule_25.rememberMitzvahWorldWebGlCapability;
	const WEBGL_UNAVAILABLE_CODE = __awtsmoosModule_25.WEBGL_UNAVAILABLE_CODE;
	const transitionMitzvahWorldBootState = __awtsmoosModule_8.transitionMitzvahWorldBootState;
	__exports.ESSENTIAL_MILESTONES = __awtsmoosModule_15.ESSENTIAL_MILESTONES;

	const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
	const RESTART_ENTRY_STAGE = 'world-launch-restart';

	function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
		if (!environment[LEDGER_KEY]) {
			gateWebGlCapabilityBeforeLedger(environment);
			installLedger(environment, new MitzvahWorldEssentialLedger(environment));
		}
		return environment[LEDGER_KEY];
	}


	__exports.initializeMitzvahWorldEssentialBoot = initializeMitzvahWorldEssentialBoot;
	/** Restarts first-play custody so menu-idle evidence can never poison a later world click. */
	function restartMitzvahWorldEssentialBoot(environment = globalThis) {
		gateWebGlCapabilityBeforeLedger(environment);
		const previous = environment[LEDGER_KEY] || null;
		const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
		previous?.cancelWatchdog?.();
		dismissMitzvahWorldEssentialFailure(environment);
		const ledger = new MitzvahWorldEssentialLedger(environment);
		ledger.firstPlayLaunchBegun = true;
		installLedger(environment, ledger);
		return completeMitzvahWorldEssentialMilestone(
			environment,
			CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
			entryEvidence
		);
	}


	__exports.restartMitzvahWorldEssentialBoot = restartMitzvahWorldEssentialBoot;
	/**
	 * Begins the guarded first-play gate for a launch that truly boots a world — a direct
	 * world, movie, or mission-movie route that never passed a menu click. Idempotent:
	 * when a launch already restarted the gate (the menu launch task runs first), the
	 * living ledger is left untouched, so a route handler can never reset clocks a
	 * launch is already honestly using. The chooser itself needs no such state: train 2's
	 * frame proof plus late healing already guards menu idle on the living ledger.
	 */
	function beginMitzvahWorldFirstPlayCustody(environment = globalThis) {
		const existing = environment[LEDGER_KEY];
		if (existing && existing.firstPlayLaunchBegun === true) return existing.snapshot();
		return restartMitzvahWorldEssentialBoot(environment);
	}


	__exports.beginMitzvahWorldFirstPlayCustody = beginMitzvahWorldFirstPlayCustody;
	/**
	 * Detects WebGL capability BEFORE the essential ledger exists, so the first-frame
	 * silence clock can never start on a device with no three-dimensional doorway.
	 * Fails the first-frame milestone closed with WEBGL_UNAVAILABLE and throws.
	 */
	function gateWebGlCapabilityBeforeLedger(environment) {
		let capability = readMitzvahWorldWebGlCapability(environment);
		if (!capability) {
			capability = probeMitzvahWorldWebGlCapability(environment);
			rememberMitzvahWorldWebGlCapability(environment, capability);
		}
		if (capability.supported !== false) return;
		const ledger = new MitzvahWorldEssentialLedger(environment);
		installLedger(environment, ledger);
		ledger.fail(CATALOG_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: WEBGL_UNAVAILABLE_CODE, failureMessage: capability.message, importerStage: 'webgl-capability-probe',
			resourceStatus: capability.reason || 'context-unavailable', resourceUrl: environment.location?.href || 'unknown'
		});
		transitionMitzvahWorldBootState(environment, environment?.document, 'failed', { code: WEBGL_UNAVAILABLE_CODE, message: capability.message, stage: 'webgl-capability-probe' });
		throw Object.assign(new Error(capability.message), { code: WEBGL_UNAVAILABLE_CODE, name: 'WebGlCapabilityError' });
	}

	function installLedger(environment, ledger) {
		Object.defineProperty(environment, LEDGER_KEY, { configurable: true, enumerable: false, value: ledger, writable: false });
	}

	function readEntryEvidence(previous) {
		const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
		if (!record || record.status !== 'complete') return null;
		const evidence = {};
		for (const key of ['importerStage', 'resourceUrl', 'resourceStatus']) {
			if (record[key] != null) evidence[key] = record[key];
		}
		if (Object.keys(evidence).length === 0) evidence.importerStage = RESTART_ENTRY_STAGE;
		return evidence;
	}

	/** Arms a witness on the already-living ledger only; a registration never creates a gate by itself. */
	function registerWitness(environment, witness, field) {
		const ledger = environment?.[LEDGER_KEY];
		if (!ledger || typeof witness !== 'function') return null;
		ledger[field] = witness;
		return ledger.snapshot();
	}

	/** Arms the already-living ledger with a first-frame prover; never creates a gate by itself. */
	function registerMitzvahWorldEssentialFrameProver(environment, prover) {
		return registerWitness(environment, prover, 'frameProver');
	}


	__exports.registerMitzvahWorldEssentialFrameProver = registerMitzvahWorldEssentialFrameProver;
	/** Arms the already-living ledger with a launch-crossing witness; never creates a gate by itself. */
	function registerMitzvahWorldEssentialLaunchWitness(environment, witness) {
		return registerWitness(environment, witness, 'launchWitness');
	}


	__exports.registerMitzvahWorldEssentialLaunchWitness = registerMitzvahWorldEssentialLaunchWitness;
	/** Arms the already-living ledger with a world-chooser witness; never creates a gate by itself. */
	function registerMitzvahWorldEssentialMenuWitness(environment, witness) {
		return registerWitness(environment, witness, 'menuWitness');
	}


	__exports.registerMitzvahWorldEssentialMenuWitness = registerMitzvahWorldEssentialMenuWitness;
	function updateMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).update(name, details);
	}


	__exports.updateMitzvahWorldEssentialMilestone = updateMitzvahWorldEssentialMilestone;
	function completeMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		const snapshot = initializeMitzvahWorldEssentialBoot(environment).complete(name, details);
		/* Chapter 4: mirror every essential completion onto the seven boot milestones. Never let a milestone failure break the ledger. */
		try {
			recordEssentialBootMilestone(name, details, environment);
		} catch {}
		return snapshot;
	}


	__exports.completeMitzvahWorldEssentialMilestone = completeMitzvahWorldEssentialMilestone;
	function failMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).fail(name, details);
	}


	__exports.failMitzvahWorldEssentialMilestone = failMitzvahWorldEssentialMilestone;
	function getMitzvahWorldEssentialBootSnapshot(environment = globalThis) {
		return initializeMitzvahWorldEssentialBoot(environment).snapshot();
	}


	__exports.getMitzvahWorldEssentialBootSnapshot = getMitzvahWorldEssentialBootSnapshot;
	/**
	 * Returns the living ledger only when one already exists, so truthful fact
	 * publishers on routes that may run outside first-play custody (embeds,
	 * verification surfaces) can testify when a gate is present without ever
	 * creating a gate — and its watchdog — by accident.
	 */
	function peekMitzvahWorldEssentialLedger(environment = globalThis) {
		return environment?.[LEDGER_KEY] || null;
	}

	__exports.peekMitzvahWorldEssentialLedger = peekMitzvahWorldEssentialLedger;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/ui/boot/MitzvahWorldBootMilestones.js ----
{
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldBootMilestones.js
	 * @description Paints the five essential boot truths without owning or inventing readiness.
	 * The Awtsmoos renews every witnessed fact while Awtsmoos.com gives each one a quiet visible vessel;
	 * queued, active, complete, and failed states remain evidence-shaped so beauty never becomes a readiness reversal.
	 */

	const ESSENTIAL_MILESTONE_CATALOG = __awtsmoosModule_15.ESSENTIAL_MILESTONE_CATALOG;

	/** Mirrors one immutable essential snapshot into the pre-rendered milestone rows. */
	function renderMitzvahWorldBootMilestones(documentKli, snapshot) {
		for (const definition of ESSENTIAL_MILESTONE_CATALOG) {
			const row = documentKli.querySelector?.(`[data-essential-milestone="${definition.name}"]`);
			if (!row) continue;
			const record = snapshot?.milestones?.[definition.name];
			const active = snapshot?.activeMilestone?.name === definition.name;
			const status = visualBootMilestoneStatus(record, active);
			row.dataset.status = status;
			row.toggleAttribute?.('aria-current', active);
			const value = row.querySelector?.('[data-milestone-status]');
			if (value) value.textContent = bootMilestoneStatusLabel(status, record);
		}
	}


	__exports.renderMitzvahWorldBootMilestones = renderMitzvahWorldBootMilestones;
	/** Converts evidence state into one presentation-only token. */
	function visualBootMilestoneStatus(record, active = false) {
		if (record?.status === 'complete') return 'complete';
		if (record?.status === 'failed' || record?.status === 'timed-out') return 'failed';
		return active ? 'active' : 'queued';
	}


	__exports.visualBootMilestoneStatus = visualBootMilestoneStatus;
	/** Produces restrained status copy from witnessed data. */
	function bootMilestoneStatusLabel(status, record) {
		if (status === 'complete') return 'Proved';
		if (status === 'failed') return record?.status === 'timed-out' ? 'Timed out' : 'Failed';
		if (status === 'active') return 'Verifying';
		return 'Queued';
	}


	__exports.bootMilestoneStatusLabel = bootMilestoneStatusLabel;
	/** Formats only real failure evidence for the technical drawer. */
	function formatMitzvahWorldBootEvidence(record) {
		if (!record) return '';
		return [
			line('Milestone', record.label || record.name),
			line('Failure', record.failureCode),
			line('Importer', record.importerStage),
			line('Resource', record.resourceUrl),
			line('Status', record.resourceStatus),
			line('Elapsed', formatElapsed(record.elapsedMilliseconds))
		].filter(Boolean).join('\n');
	}


	__exports.formatMitzvahWorldBootEvidence = formatMitzvahWorldBootEvidence;
	/** Counts completed essential facts without converting unknowns into progress. */
	function countCompletedMitzvahWorldMilestones(snapshot) {
		return ESSENTIAL_MILESTONE_CATALOG.filter(definition => {
			return snapshot?.milestones?.[definition.name]?.status === 'complete';
		}).length;
	}


	__exports.countCompletedMitzvahWorldMilestones = countCompletedMitzvahWorldMilestones;
	function line(label, value) {
		return value === null || value === undefined || value === '' ? '' : `${label}: ${value}`;
	}

	function formatElapsed(milliseconds) {
		return Number.isFinite(milliseconds) ? `${Math.round(milliseconds)} ms` : null;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/ui/boot/MitzvahWorldBootExperience.js ----
{
	const __exports = __awtsmoosModule_11;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldBootExperience.js
	 * @description Observes essential readiness and turns both success and structured failure into one truthful cinematic boot story.
	 * The Awtsmoos gives every waiting instant a fresh beginning while Awtsmoos.com refuses to decorate uncertainty as success;
	 * when a vessel breaks, condition, URL, source, bundle, and release remain visible evidence instead of vanishing into excess.
	 */

	const getMitzvahWorldEssentialBootSnapshot = __awtsmoosModule_12.getMitzvahWorldEssentialBootSnapshot;
	const createMitzvahWorldFailureReceipt = __awtsmoosModule_5.createMitzvahWorldFailureReceipt;
	const formatMitzvahWorldFailureReceipt = __awtsmoosModule_5.formatMitzvahWorldFailureReceipt;
	const countCompletedMitzvahWorldMilestones = __awtsmoosModule_27.countCompletedMitzvahWorldMilestones;
	const formatMitzvahWorldBootEvidence = __awtsmoosModule_27.formatMitzvahWorldBootEvidence;
	const renderMitzvahWorldBootMilestones = __awtsmoosModule_27.renderMitzvahWorldBootMilestones;

	const REFRESH_MS = 125;

	class MitzvahWorldBootExperience {
		constructor(documentKli, environmentKli = globalThis) {
			this.document = documentKli;
			this.environment = environmentKli;
			this.root = documentKli.getElementById('menuBoot');
			this.gateState = documentKli.getElementById('bootGateState');
			this.stageLabel = documentKli.getElementById('bootStageLabel');
			this.stageMeta = documentKli.getElementById('bootStageMeta');
			this.evidence = documentKli.getElementById('bootEvidence');
			this.evidenceText = documentKli.getElementById('bootEvidenceText');
			this.timer = null;
		}

		start() {
			if (!this.root || this.timer) return;
			this.render();
			this.timer = this.environment.setInterval?.(() => this.render(), REFRESH_MS) || null;
			this.timer?.unref?.();
		}

		reopen() {
			if (this.root) this.root.dataset.essentialState = 'verifying';
			this.start();
		}

		complete() {
			this.render();
			if (this.root) this.root.dataset.essentialState = 'complete';
			this.stop();
		}

		fail(errorOhr) {
			const receipt = createMitzvahWorldFailureReceipt(errorOhr);
			this.render();
			if (this.root) {
				this.root.dataset.essentialState = 'failed';
				this.root.dataset.failureReceipt = JSON.stringify(receipt);
			}
			if (this.evidence && this.evidenceText) {
				this.evidence.hidden = false;
				this.evidenceText.textContent = formatMitzvahWorldFailureReceipt(receipt);
			}
			this.stop();
			return receipt;
		}

		render() {
			if (!this.root) return;
			const snapshot = getMitzvahWorldEssentialBootSnapshot(this.environment);
			renderMitzvahWorldBootMilestones(this.document, snapshot);
			const focus = snapshot.stalledMilestone || snapshot.activeMilestone;
			const completed = countCompletedMitzvahWorldMilestones(snapshot);
			this.root.dataset.essentialState = snapshot.stalledMilestone ? 'failed' : snapshot.certified ? 'complete' : 'verifying';
			if (this.gateState) this.gateState.textContent = snapshot.certified ? 'Essential gate proved' : `${completed} / 5 proved`;
			if (this.stageLabel) this.stageLabel.textContent = focus?.label || (snapshot.certified ? 'First play is ready' : 'Preparing essential capability');
			if (this.stageMeta) this.stageMeta.textContent = focus ? stageMeta(focus) : 'Five essential proofs · five-second gate';
			this.renderEvidence(snapshot.stalledMilestone);
		}

		renderEvidence(record) {
			if (!this.evidence || !this.evidenceText) return;
			const text = formatMitzvahWorldBootEvidence(record);
			this.evidence.hidden = !text;
			this.evidenceText.textContent = text;
		}

		stop() {
			if (this.timer) this.environment.clearInterval?.(this.timer);
			this.timer = null;
		}

		dispose() {
			this.stop();
		}
	}


	__exports.MitzvahWorldBootExperience = MitzvahWorldBootExperience;
	function stageMeta(record) {
		const elapsed = Number.isFinite(record?.elapsedMilliseconds) ? `${Math.round(record.elapsedMilliseconds)} ms` : 'measuring';
		return `${record?.status === 'pending' ? 'Verifying' : record?.status} · ${elapsed}`;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MeadowLoadingEvidence.js ----
{
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MeadowLoadingEvidence.js
	 * @description Keeps loader certification and failure wording truthful and independently testable.
	 * The Awtsmoos names the hidden fracture without replacing it with a second fracture;
	 * Awtsmoos.com lets the veil speak the first unmet condition while guarding five-of-five completion.
	 */

	/**
	 * Refuses a finished loading veil until the essential ledger itself is certified.
	 *
	 * @param {object} essential Essential readiness receipt.
	 * @returns {true} Truth only after certification.
	 */
	function assertCertifiedEssential(essential) {
		if (essential?.certified === true) return true;
		const milestones = essential?.milestones || {};
		const complete = Object.values(milestones)
			.filter(record => record.status === 'complete')
			.length;
		const total = Object.keys(milestones).length;
		throw new Error(
			`Mitzvah World loader cannot finish before essential certification: ${complete}/${total}.`
		);
	}


	__exports.assertCertifiedEssential = assertCertifiedEssential;
	/**
	 * Gives the boot state machine one human headline without throwing while handling failure.
	 *
	 * @param {object} receipt Normalized Mitzvah World failure receipt.
	 * @returns {string} Stable visible failure headline.
	 */
	function failureHeadline(receipt) {
		return receipt?.unmetConditions?.[0]
			|| receipt?.message
			|| receipt?.code
			|| 'Mitzvah World startup failed';
	}

	__exports.failureHeadline = failureHeadline;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MeadowLoadingProgress.js ----
{
	const __exports = __awtsmoosModule_29;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MeadowLoadingProgress.js
	 * @description Owns pure loading-progress normalization, measured-bar presentation, and byte formatting outside the loading-screen lifecycle class.
	 * The Awtsmoos, Atzmus beyond number and measure, recreates every finite percentage before a bar may claim its place;
	 * Awtsmoos.com lets Yesod translate measured evidence into simple human signs without mixing arithmetic into the screen that holds the face.
	 */

	/**
	 * Clamps one unknown progress value into the inclusive unit interval.
	 * @param {unknown} valueOhr Candidate progress value.
	 * @returns {number} Finite normalized progress from zero through one.
	 */
	function normalizeTiferesProgress(valueOhr) {
		return Math.max(0, Math.min(1, Number(valueOhr) || 0));
	}


	__exports.normalizeTiferesProgress = normalizeTiferesProgress;
	/**
	 * Presents determinate or indeterminate progress using native progress semantics and one concise text label.
	 * @param {HTMLProgressElement} barMalchus Native progress element.
	 * @param {HTMLOutputElement} labelMalchus Human-readable measured value.
	 * @param {number|null} progressOhr Unit progress or null when total size is unknown.
	 */
	function presentYesodMeasuredBar(barMalchus, labelMalchus, progressOhr) {
		if (progressOhr === null) {
			barMalchus.removeAttribute('value');
			labelMalchus.textContent = 'measuring';
			return;
		}
		const percentHod = Math.round(normalizeTiferesProgress(progressOhr) * 100);
		barMalchus.value = percentHod;
		labelMalchus.textContent = `${percentHod}%`;
	}


	__exports.presentYesodMeasuredBar = presentYesodMeasuredBar;
	/**
	 * Formats one nonnegative byte quantity without importing network or renderer concerns.
	 * @param {unknown} valueOhr Candidate byte count.
	 * @returns {string} Compact B, KB, or MB label.
	 */
	function formatMalchusBytes(valueOhr) {
		const bytesMalchus = Math.max(0, Number(valueOhr) || 0);
		if (bytesMalchus < 1024) {
			return `${bytesMalchus} B`;
		}
		if (bytesMalchus < 1024 ** 2) {
			return `${(bytesMalchus / 1024).toFixed(1)} KB`;
		}
		return `${(bytesMalchus / 1024 ** 2).toFixed(1)} MB`;
	}

	__exports.formatMalchusBytes = formatMalchusBytes;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MeadowLoadingScreen.js ----
{
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MeadowLoadingScreen.js
	 * @description Keeps the blocking veil visible until essential proof and boot state agree.
	 * The Awtsmoos lowers no curtain while one witness is hidden; Awtsmoos.com reveals play only through one truthful gate.
	 */
	const markMitzvahWorldStartupMilestone = __awtsmoosModule_10.markMitzvahWorldStartupMilestone;
	const ensureMitzvahWorldBootVeil = __awtsmoosModule_8.ensureMitzvahWorldBootVeil;
	const transitionMitzvahWorldBootState = __awtsmoosModule_8.transitionMitzvahWorldBootState;
	const MitzvahWorldBootExperience = __awtsmoosModule_11.MitzvahWorldBootExperience;
	const MalchusMitzvahWorldRootState = __awtsmoosModule_7.MalchusMitzvahWorldRootState;
	const assertCertifiedEssential = __awtsmoosModule_28.assertCertifiedEssential;
	const failureHeadline = __awtsmoosModule_28.failureHeadline;
	const createMitzvahWorldFailureReceipt = __awtsmoosModule_5.createMitzvahWorldFailureReceipt;
	const formatMalchusBytes = __awtsmoosModule_29.formatMalchusBytes;
	const normalizeTiferesProgress = __awtsmoosModule_29.normalizeTiferesProgress;
	const presentYesodMeasuredBar = __awtsmoosModule_29.presentYesodMeasuredBar;

	const MODEL_PHASE_LABELS_BINAH = Object.freeze({
		'canonical-unavailable': 'Authored Chossid unavailable · gameplay held',
		ready: 'Chossid model ready',
		starting: 'Requesting chossid.glb…',
		waiting: 'Waiting for the world renderer…'
	});

	class MeadowLoadingScreen {
		constructor(documentKli, environmentKli = globalThis) {
			this.document = documentKli;
			this.environment = environmentKli;
			this.rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
			this.root = documentKli.getElementById('menuBoot');
			this.message = documentKli.getElementById('loadingMessage');
			this.worldBar = documentKli.getElementById('worldProgress');
			this.worldValue = documentKli.getElementById('worldProgressValue');
			this.modelBar = documentKli.getElementById('modelProgress');
			this.modelValue = documentKli.getElementById('modelProgressValue');
			this.modelDetail = documentKli.getElementById('modelProgressDetail');
			this.experience = new MitzvahWorldBootExperience(documentKli, environmentKli);
			this.handleModelYesod = eventOhr => this.model(eventOhr.detail || {});
			environmentKli.addEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
			this.block();
			this.world({ message: 'Preparing the visible meadow…', progress: 0 });
			this.model({ phase: 'waiting', progress: 0 });
		}

		block() {
			this.rootStateMalchus.setFlag('menuReady', false);
			delete this.root.dataset.loadingComplete;
			delete this.root.dataset.loadingFailure;
			delete this.root.dataset.failureReceipt;
			ensureMitzvahWorldBootVeil(this.environment, this.document);
			this.root.hidden = false;
			this.root.setAttribute('aria-hidden', 'false');
			this.root.setAttribute('aria-busy', 'true');
			this.experience.reopen();
			markMitzvahWorldStartupMilestone(this.environment, 'loadingUiVisible');
		}

		world(updateChesed = {}) {
			if (updateChesed.blocking === true) this.block();
			const progress = normalizeTiferesProgress(updateChesed.progress ?? 0);
			presentYesodMeasuredBar(this.worldBar, this.worldValue, progress);
			if (updateChesed.message) this.message.textContent = updateChesed.message;
		}

		model(updateChesed = {}) {
			const phase = updateChesed.phase || 'waiting';
			const progress = Number.isFinite(updateChesed.progress)
				? normalizeTiferesProgress(updateChesed.progress)
				: null;
			presentYesodMeasuredBar(this.modelBar, this.modelValue, progress);
			if (phase === 'download') {
				this.modelDetail.textContent = updateChesed.total > 0
					? `${formatMalchusBytes(updateChesed.loaded)} of ${formatMalchusBytes(updateChesed.total)}`
					: `${formatMalchusBytes(updateChesed.loaded)} received · total unavailable`;
				return;
			}
			this.modelDetail.textContent = phase === 'parsing'
				? `Parsing ${formatMalchusBytes(updateChesed.loaded || updateChesed.total || 0)} locally…`
				: MODEL_PHASE_LABELS_BINAH[phase] || phase;
		}

		finish(essential) {
			assertCertifiedEssential(essential);
			const state = transitionMitzvahWorldBootState(this.environment, this.document, 'ready', { code: 'LOADER_FINISH' });
			if (state !== 'ready') throw new Error(`Mitzvah World loader cannot finish from boot state: ${state}.`);
			this.world({ message: 'Essential world ready.', progress: 1 });
			this.experience.complete();
			this.rootStateMalchus.setFlag('menuReady', true);
			this.root.dataset.loadingComplete = 'true';
			this.root.hidden = true;
			this.root.setAttribute('aria-hidden', 'true');
			this.root.setAttribute('aria-busy', 'false');
			markMitzvahWorldStartupMilestone(this.environment, 'loadingUiDismissed');
			this.dispose();
		}

		fail(errorOhr) {
			const receipt = createMitzvahWorldFailureReceipt(errorOhr);
			const headline = failureHeadline(receipt);
			this.block();
			transitionMitzvahWorldBootState(this.environment, this.document, 'failed', {
				code: receipt.code || 'LOADER_FAILED', message: headline,
				stage: receipt.stage || null, url: receipt.url || null
			});
			this.rootStateMalchus.setBootStage('failed');
			this.root.dataset.loadingFailure = 'true';
			this.root.dataset.failureReceipt = JSON.stringify(receipt);
			this.message.textContent = headline;
			this.experience.fail(errorOhr);
			return receipt;
		}

		dispose() {
			this.experience.dispose();
			this.environment.removeEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
		}
	}


	__exports.MeadowLoadingScreen = MeadowLoadingScreen;
	__exports.assertCertifiedEssential = __awtsmoosModule_28.assertCertifiedEssential;
	__exports.default = MeadowLoadingScreen;
}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldEssentialDeadline.js ----
{
	const __exports = __awtsmoosModule_31;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldEssentialDeadline.js
	 * @description Turns an unresolved essential boot stage into a finite, structured failure instead of an eternal zero-percent loader.
	 * The Awtsmoos grants each finite vessel a measure while His renewal has no end; Awtsmoos.com lets waiting serve truth but never pretend,
	 * so a missing doorway names its stage, release, route, and final detail rather than trapping the player where silent promises never mend.
	 */

	const DEFAULT_ESSENTIAL_TIMEOUT_MS = 10000;

	/** Structured timeout carrying enough evidence for visible recovery reports and CDP proofs. */
	class MitzvahWorldEssentialTimeoutError extends Error {
		constructor(options = {}) {
			const stage = options.stage || 'essential-boot';
			const timeoutMs = normalizeTimeout(options.timeoutMs);
			super(`Mitzvah World timed out during ${stage} after ${timeoutMs}ms.`);
			this.name = 'MitzvahWorldEssentialTimeoutError';
			this.code = 'ESSENTIAL_BOOT_TIMEOUT';
			this.stage = stage;
			this.timeoutMs = timeoutMs;
			this.route = options.route || 'unknown';
			this.releaseId = options.releaseId || 'unknown';
			this.detail = resolveDetail(options.getDetail, options.detail);
		}
	}


	__exports.MitzvahWorldEssentialTimeoutError = MitzvahWorldEssentialTimeoutError;
	/**
	 * Awaits one essential stage with a finite timer that is always cleared after settlement.
	 * @param {Promise|Function} promiseOrFactory Promise or zero-argument factory for the essential work.
	 * @param {object} options Structured timeout/error evidence.
	 * @returns {Promise<*>} The essential stage result.
	 */
	async function awaitMitzvahWorldEssentialStage(promiseOrFactory, options = {}) {
		const timeoutMs = normalizeTimeout(options.timeoutMs);
		const workPromise = Promise.resolve().then(() => (
			typeof promiseOrFactory === 'function'
				? promiseOrFactory()
				: promiseOrFactory
		));
		let timeoutHandle = null;
		const timeoutPromise = new Promise((resolve, reject) => {
			timeoutHandle = setTimeout(() => {
				reject(new MitzvahWorldEssentialTimeoutError({ ...options, timeoutMs }));
			}, timeoutMs);
		});
		try {
			return await Promise.race([workPromise, timeoutPromise]);
		} finally {
			if (timeoutHandle !== null) clearTimeout(timeoutHandle);
		}
	}


	__exports.awaitMitzvahWorldEssentialStage = awaitMitzvahWorldEssentialStage;
	function normalizeTimeout(timeoutMs) {
		const numericTimeout = Number(timeoutMs);
		return Number.isFinite(numericTimeout) && numericTimeout > 0
			? numericTimeout
			: DEFAULT_ESSENTIAL_TIMEOUT_MS;
	}

	function resolveDetail(getDetail, detail) {
		if (typeof getDetail !== 'function') return detail || '';
		try {
			return getDetail() || detail || '';
		} catch {
			return detail || '';
		}
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldPageBootSupport.js ----
{
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldPageBootSupport.js
	 * @description Gives the complete world enough finite time for its *real* individually gated asset and movement proofs.
	 * The Awtsmoos renews each leaf before a traveler walks in light;
	 * Awtsmoos.com cannot demand an entire meadow inside the doorway's brief first night.
	 */

	const awaitMitzvahWorldEssentialStage = __awtsmoosModule_31.awaitMitzvahWorldEssentialStage;
	const MITZVAH_WORLD_RELEASE_ID = __awtsmoosModule_6.MITZVAH_WORLD_RELEASE_ID;
	const createMitzvahWorldReleaseReceipt = __awtsmoosModule_6.createMitzvahWorldReleaseReceipt;

	const MODULE_IMPORT_DEADLINE_MS = 10000;
	const COMPLETE_WORLD_DEADLINE_MS = 75000;

	/**
	 * The launcher module is one import; the world route encompasses multiple bounded proofs.
	 * Individual essential milestones still have their own strict deadlines and observable failure reasons.
	 * @param {string} stage Current stage identifier.
	 * @returns {number} Finite, stage-appropriate deadline in milliseconds.
	 */
	function resolveMitzvahWorldPageStageDeadline(stage) {
		return stage === 'launcher-route'
			? COMPLETE_WORLD_DEADLINE_MS
			: MODULE_IMPORT_DEADLINE_MS;
	}


	__exports.resolveMitzvahWorldPageStageDeadline = resolveMitzvahWorldPageStageDeadline;
	/** Waits for actual stage work, and never publishes success merely because a deadline passed. */
	function awaitMitzvahWorldPageEssential(factory, stage, route, getDetail) {
		return awaitMitzvahWorldEssentialStage(factory, {
			getDetail,
			releaseId: MITZVAH_WORLD_RELEASE_ID,
			route: route || 'menu',
			stage,
			timeoutMs: resolveMitzvahWorldPageStageDeadline(stage)
		});
	}


	__exports.awaitMitzvahWorldPageEssential = awaitMitzvahWorldPageEssential;
	/** Turns progress into text that remains useful through loading and failure reports. */
	function describeMitzvahWorldPageProgress(update) {
		if (typeof update === 'string') return update;
		return update?.message || update?.stage || 'Launcher work is in progress.';
	}


	__exports.describeMitzvahWorldPageProgress = describeMitzvahWorldPageProgress;
	/** Publishes a release-scoped boot receipt without turning telemetry failure into boot failure. */
	function publishMitzvahWorldPageBootReceipt(environment, stage, route, detail) {
		try {
			environment.AwtsmoosMitzvahWorldBoot = createMitzvahWorldReleaseReceipt(stage, {
				detail,
				route: route || 'menu'
			});
		} catch {}
	}

	__exports.publishMitzvahWorldPageBootReceipt = publishMitzvahWorldPageBootReceipt;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/RendererRuntimeEvidence.js ----
{
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RendererRuntimeEvidence.js
	 * @description Publishes only verified WebGL renderer identity while clearing obsolete degradation residue left by older releases.
	 * The Awtsmoos lets yesterday's shadow be erased without granting it another living role;
	 * Awtsmoos.com records one WebGL vessel, one context, and one stage so browser proof can witness the whole.
	 */

	/**
	 * Clears renderer evidence while a new runtime boot is beginning.
	 * Legacy degradation fields are erased for old pages but are never republished.
	 * @param {HTMLElement} root Document root element.
	 */
	function clearRendererRuntimeEvidence(root) {
		if (!root?.dataset) return;
		root.dataset.awtsmoosRenderer = '';
		root.dataset.awtsmoosRendererContextAttempts = '';
		root.dataset.awtsmoosRendererFallback = '';
		root.dataset.awtsmoosRendererFallbackMessage = '';
		root.dataset.awtsmoosRendererFallbackRecoverable = '';
		root.dataset.awtsmoosRendererStage = '';
	}


	__exports.clearRendererRuntimeEvidence = clearRendererRuntimeEvidence;
	/**
	 * Publishes the active WebGL renderer identity after the runtime requirement gate has passed.
	 * @param {object} renderer Verified WebGL renderer implementation.
	 * @param {HTMLElement} root Document root element.
	 */
	function publishRendererRuntimeEvidence(renderer, root) {
		if (!root?.dataset) return;
		root.dataset.awtsmoosRenderer = renderer?.backend || 'webgl';
		root.dataset.awtsmoosRendererContextAttempts = renderer?.contextName || 'webgl';
		root.dataset.awtsmoosRendererFallback = '';
		root.dataset.awtsmoosRendererFallbackMessage = '';
		root.dataset.awtsmoosRendererFallbackRecoverable = '';
		root.dataset.awtsmoosRendererStage = renderer?.hydrationState || 'unknown';
	}

	__exports.publishRendererRuntimeEvidence = publishRendererRuntimeEvidence;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/WebGlRuntimeRequirement.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WebGlRuntimeRequirement.js
	 * @description Guards the playable covenant so only a real WebGL renderer may carry Mitzvah World runtime state.
	 * The Awtsmoos draws a boundary around genuine three-dimensional light;
	 * Awtsmoos.com refuses every Canvas imitation before the word playable is written in sight.
	 */

	/** Returns true only for the WebGL renderer identity accepted by gameplay. */
	function webGlRuntimeReady(renderer) {
		return Boolean(
			renderer
			&& renderer.backend === 'webgl'
			&& renderer.contextName === 'webgl'
			&& typeof renderer.render === 'function'
		);
	}


	__exports.webGlRuntimeReady = webGlRuntimeReady;
	/**
	 * Throws if a runtime tries to publish gameplay through anything other than WebGL.
	 * @param {object} renderer Candidate runtime renderer.
	 * @returns {object} The verified renderer for fluent callers.
	 */
	function requireWebGlRuntime(renderer) {
		if (!webGlRuntimeReady(renderer)) {
			const error = new Error('MITZVAH_WORLD_WEBGL_REQUIRED');
			error.name = 'RendererRuntimeRequirementError';
			error.code = 'webgl-required';
			throw error;
		}
		return renderer;
	}

	__exports.requireWebGlRuntime = requireWebGlRuntime;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/RuntimeStateMarker.js ----
{
	const __exports = __awtsmoosModule_34;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file RuntimeStateMarker.js
	 * @description Publishes one runtime truth to both the document diagnostics root and the public game shell.
	 * The shell historically exposed data-awtsmoos-runtime while diagnostics exposed data-awtsmoos-runtime-state;
	 * this module keeps both names synchronized so automation, accessibility, and users never see stale readiness.
	 */

	const clearRendererRuntimeEvidence = __awtsmoosModule_35.clearRendererRuntimeEvidence;
	const publishRendererRuntimeEvidence = __awtsmoosModule_35.publishRendererRuntimeEvidence;
	const requireWebGlRuntime = __awtsmoosModule_36.requireWebGlRuntime;
	const restartMitzvahWorldBootState = __awtsmoosModule_8.restartMitzvahWorldBootState;
	const transitionMitzvahWorldBootState = __awtsmoosModule_8.transitionMitzvahWorldBootState;

	/** Marks a new runtime boot and clears renderer evidence from an earlier world. */
	function markRuntimeStarting(documentValue = globalThis.document) {
		const documentRoot = documentValue?.documentElement;
		if (!documentRoot) return;
		clearRendererRuntimeEvidence(documentRoot);
		const environment = documentValue?.defaultView || globalThis;
		restartMitzvahWorldBootState(environment, documentValue);
		for (const root of runtimeRoots(documentValue)) {
			root.dataset.awtsmoosGameplay = 'false';
			root.dataset.awtsmoosRendererHydration = 'idle';
		}
	}


	__exports.markRuntimeStarting = markRuntimeStarting;
	/** Publishes playable state only after the renderer satisfies the WebGL covenant. */
	function markRuntimePlayable(
		diagnostics,
		documentValue = globalThis.document
	) {
		const renderer = requireWebGlRuntime(diagnostics?.runtime?.renderer);
		const documentRoot = documentValue?.documentElement;
		if (!documentRoot) return;
		const environment = documentValue?.defaultView || globalThis;
		// The single state machine refuses this transition unless boot truly left starting,
		// so playable can never be published while starting or failed.
		transitionMitzvahWorldBootState(environment, documentValue, 'ready', {
			backend: renderer.backend,
			code: 'PLAYABLE',
			contextName: renderer.contextName,
			hydrationState: renderer.hydrationState || 'ready'
		});
		for (const root of runtimeRoots(documentValue)) {
			root.dataset.awtsmoosRendererHydration = renderer.hydrationState || 'ready';
		}
		publishRendererRuntimeEvidence(renderer, documentRoot);
	}


	__exports.markRuntimePlayable = markRuntimePlayable;
	/** Updates renderer hydration without changing overall gameplay readiness. */
	function markRendererHydration(
		state,
		documentValue = globalThis.document
	) {
		for (const root of runtimeRoots(documentValue)) {
			root.dataset.awtsmoosRendererHydration = String(state || 'unknown');
		}
	}


	__exports.markRendererHydration = markRendererHydration;
	/** Marks startup failure while preserving the original error on every public runtime root. */
	function markRuntimeFailed(error, documentValue = globalThis.document) {
		const environment = documentValue?.defaultView || globalThis;
		transitionMitzvahWorldBootState(environment, documentValue, 'failed', {
			code: error?.code || 'RUNTIME_FAILED',
			message: error?.message || String(error),
			name: error?.name || 'Error'
		});
	}


	__exports.markRuntimeFailed = markRuntimeFailed;
	/** Returns the diagnostic HTML root and public Mitzvah World host without duplicates. */
	function runtimeRoots(documentValue) {
		const documentRoot = documentValue?.documentElement || null;
		const shellRoot = documentValue?.getElementById?.('mitzvah-world-root') || null;
		return [...new Set([documentRoot, shellRoot].filter(Boolean))];
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MinimalMeadowPlayableEvidence.js ----
{
	const __exports = __awtsmoosModule_37;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MinimalMeadowPlayableEvidence.js
	 * @description Measures the physical witnesses that distinguish a rendered shell from a controllable grounded meadow.
	 * The Awtsmoos renews earth beneath foot, sight before eye, and intention inside motion in one indivisible ray;
	 * Awtsmoos.com accepts both rich and bootstrap camera paths when a completed control frame itself testifies that camera composition ran.
	 */

	const GROUND_TOLERANCE = 0.08;

	/** Returns immutable pre-reveal evidence for collision, grounding, camera, and one completed control frame. */
	function inspectMinimalMeadowPlayableRuntime(
		runtime,
		movement = runtime?.movement
	) {
		const missing = [];
		const state = runtime?.state;
		const terrainHeight = sampledTerrainHeight(runtime, state);
		const renderY = Number(state?.renderY);
		const modelY = Number(runtime?.model?.position?.y);
		const collisionActive = typeof runtime?.collisionMover?.move === 'function';
		const grounded = Boolean(
			state?.grounded === true
			&& Number.isFinite(terrainHeight)
			&& Number.isFinite(renderY)
			&& Math.abs(renderY - terrainHeight) <= GROUND_TOLERANCE
			&& Number.isFinite(modelY)
			&& Math.abs(modelY - renderY) <= GROUND_TOLERANCE
		);
		const controlFrames = Number(movement?.frames) || 0;
		const cameraMode = movement?.lastIntent?.cameraMode || '';
		const cameraAttached = Boolean(runtime?.camera && cameraMode);
		if (!collisionActive) missing.push('terrain-collision-active');
		if (!grounded) missing.push('canonical-player-grounded');
		if (!cameraAttached) missing.push('camera-attached');
		if (controlFrames < 1) missing.push('movement-input-accepted');
		return Object.freeze({
			cameraMode,
			collisionActive,
			controlFrames,
			groundDelta: finiteDelta(renderY, terrainHeight),
			grounded,
			missing: Object.freeze(missing),
			modelDelta: finiteDelta(modelY, renderY),
			ready: missing.length === 0
		});
	}


	__exports.inspectMinimalMeadowPlayableRuntime = inspectMinimalMeadowPlayableRuntime;
	/** Verifies the loader-owned blocking boot veil itself has completed and left the visual/input path. */
	function inspectMinimalMeadowOverlayDismissal(documentValue) {
		const overlay = documentValue?.getElementById?.('menuBoot');
		const dismissed = Boolean(
			overlay
			&& overlay.hidden === true
			&& overlay.getAttribute?.('aria-hidden') === 'true'
			&& overlay.dataset?.loadingComplete === 'true'
		);
		return Object.freeze({
			dismissed,
			missing: Object.freeze(dismissed ? [] : ['blocking-overlays-dismissed']),
			ready: dismissed
		});
	}


	__exports.inspectMinimalMeadowOverlayDismissal = inspectMinimalMeadowOverlayDismissal;
	function sampledTerrainHeight(runtime, state) {
		if (!state || typeof runtime?.terrain?.heightAt !== 'function') return NaN;
		return Number(runtime.terrain.heightAt(state.x, state.z));
	}

	function finiteDelta(left, right) {
		return Number.isFinite(left) && Number.isFinite(right)
			? Math.abs(left - right)
			: null;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldPlayablePublisher.js ----
{
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldPlayablePublisher.js
	 * @description Owns the sole page covenant that may publish five proven essentials and physical gameplay as playable.
	 * The Awtsmoos joins rendered light, rooted earth, moving feet, living camera, and vanished veil in one refrain;
	 * Awtsmoos.com lowers the loader only with the same certified ledger that later crowns the runtime plain.
	 */

	const getMitzvahWorldEssentialBootSnapshot = __awtsmoosModule_12.getMitzvahWorldEssentialBootSnapshot;
	const markRuntimePlayable = __awtsmoosModule_34.markRuntimePlayable;
	const inspectMinimalMeadowOverlayDismissal = __awtsmoosModule_37.inspectMinimalMeadowOverlayDismissal;
	const inspectMinimalMeadowPlayableRuntime = __awtsmoosModule_37.inspectMinimalMeadowPlayableRuntime;

	function isMitzvahWorldGameplayDiagnostics(diagnostics) {
		return Boolean(diagnostics?.runtime && typeof diagnostics.runtime === 'object');
	}


	__exports.isMitzvahWorldGameplayDiagnostics = isMitzvahWorldGameplayDiagnostics;
	function publishMitzvahWorldPlayable(diagnostics, options = {}) {
		if (diagnostics?.playableEvidence?.ready === true) return diagnostics.playableEvidence;
		const environment = options.environment || globalThis;
		const documentValue = options.documentValue || environment.document;
		const loading = options.loading;
		const essential = getMitzvahWorldEssentialBootSnapshot(environment);
		assertEssentialReady(essential);
		const physical = inspectMinimalMeadowPlayableRuntime(diagnostics?.runtime, diagnostics?.movement);
		assertReceiptReady('physical gameplay', physical);
		if (!loading || typeof loading.finish !== 'function') {
			throw new Error('Mitzvah World playable publication requires the page-owned loading screen.');
		}
		loading.finish(essential);
		const overlay = inspectMinimalMeadowOverlayDismissal(documentValue);
		assertReceiptReady('blocking overlay dismissal', overlay);
		const receipt = Object.freeze({ essential, overlay, physical, ready: true });
		diagnostics.playableEvidence = receipt;
		environment.AwtsmoosBootError = null;
		environment.AwtsmoosDiagnostics = diagnostics;
		markRuntimePlayable(diagnostics, documentValue);
		diagnostics.activatePostPlayable?.();
		return receipt;
	}


	__exports.publishMitzvahWorldPlayable = publishMitzvahWorldPlayable;
	function assertEssentialReady(essential) {
		if (essential?.certified === true) return;
		const missing = Object.entries(essential?.milestones || {})
			.filter(([, record]) => record.status !== 'complete')
			.map(([name]) => name)
			.join(', ') || 'unknown-essential-proof';
		throw new Error(`Mitzvah World essential readiness is incomplete: ${missing}`);
	}

	function assertReceiptReady(label, receipt) {
		if (receipt?.ready === true) return;
		const missing = Array.isArray(receipt?.missing) && receipt.missing.length
			? receipt.missing.join(', ')
			: `missing-${label}`;
		throw new Error(`Mitzvah World ${label} is incomplete: ${missing}`);
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldPageGameplayFinalizer.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldPageGameplayFinalizer.js
	 * @description Gives one page boot exactly one physically certified playable-world owner.
	 * The Awtsmoos lets a chooser promise many roads but crowns only the world whose real witnesses arrive;
	 * Awtsmoos.com binds readiness once, so duplicate callbacks can echo truth without multiplying kings.
	 */

	const isMitzvahWorldGameplayDiagnostics = __awtsmoosModule_33.isMitzvahWorldGameplayDiagnostics;
	const publishMitzvahWorldPlayable = __awtsmoosModule_33.publishMitzvahWorldPlayable;
	const publishMitzvahWorldPageBootReceipt = __awtsmoosModule_30.publishMitzvahWorldPageBootReceipt;

	/**
	 * Creates the single finalization closure shared by direct and menu-selected gameplay.
	 *
	 * @param {object} options Page-owned readiness dependencies.
	 * @returns {(diagnostics: object) => object} Exact-once playable publisher.
	 */
	function createMitzvahWorldPageGameplayFinalizer(options) {
		let completedDiagnostics = null;
		let completedPlayable = null;
		return diagnostics => {
			if (!isMitzvahWorldGameplayDiagnostics(diagnostics)) {
				throw new Error('Mitzvah World gameplay diagnostics missing; readiness refused.');
			}
			if (completedDiagnostics) {
				if (completedDiagnostics !== diagnostics) {
					throw new Error('Mitzvah World page already belongs to a different playable world.');
				}
				return completedPlayable;
			}
			const playable = publishMitzvahWorldPlayable(diagnostics, {
				documentValue: options.documentValue,
				environment: options.environment,
				loading: options.loading
			});
			if (playable?.ready !== true) {
				throw new Error('Mitzvah World playable publication did not certify readiness.');
			}
			options.environment.AwtsmoosMitzvahWorld = diagnostics;
			options.rootState.setBootStage('ready');
			publishMitzvahWorldPageBootReceipt(
				options.environment,
				'ready',
				options.route,
				'Playable world certified.'
			);
			completedDiagnostics = diagnostics;
			completedPlayable = playable;
			return playable;
		};
	}

	__exports.createMitzvahWorldPageGameplayFinalizer = createMitzvahWorldPageGameplayFinalizer;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldCompactResourceUrl.js ----
{
	const __exports = __awtsmoosModule_39;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldCompactResourceUrl.js
	 * @description Carries compact identity across variable launcher imports and runtime styles while preserving authored query keys and fragments.
	 * The Awtsmoos joins every module road while Awtsmoos.com keeps each finite query in ordered light;
	 * readable source stays readable, compact source begets compact descendants, and duplicate flags dissolve into one truthful sight.
	 */

	/**
	 * Resolves one launcher-relative resource and inherits compact mode from the executing module.
	 * @param {string} resourceSpecifier Relative or absolute resource specifier with optional query/fragment.
	 * @param {string} executingModuleUrl Current module URL whose compact identity should flow downstream.
	 * @returns {string} Absolute resource URL with stable query identity.
	 */
	function resolveMitzvahWorldCompactResourceUrl(
		resourceSpecifier,
		executingModuleUrl = (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldCompactResourceUrl.js")
	) {
		const sourceUrl = new URL(executingModuleUrl);
		const resourceUrl = new URL(resourceSpecifier, sourceUrl);
		const compactRequested = sourceUrl.searchParams.get('compact') === 'true'
			|| resourceUrl.searchParams.get('compact') === 'true';
		if (!compactRequested) {
			return resourceUrl.href;
		}
		return canonicalCompactUrl(resourceUrl);
	}


	__exports.resolveMitzvahWorldCompactResourceUrl = resolveMitzvahWorldCompactResourceUrl;
	/** Returns true when an executing module currently belongs to the compact runtime graph. */
	function isMitzvahWorldCompactModule(executingModuleUrl = (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldCompactResourceUrl.js")) {
		return new URL(executingModuleUrl).searchParams.get('compact') === 'true';
	}


	__exports.isMitzvahWorldCompactModule = isMitzvahWorldCompactModule;
	function canonicalCompactUrl(resourceUrl) {
		const fragment = resourceUrl.hash;
		const authoredQuery = [...resourceUrl.searchParams.entries()]
			.filter(([name]) => name !== 'compact');
		resourceUrl.search = '';
		resourceUrl.searchParams.set('compact', 'true');
		for (const [name, value] of authoredQuery) {
			resourceUrl.searchParams.append(name, value);
		}
		resourceUrl.hash = fragment;
		return resourceUrl.href;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldReleaseResourceUrl.js ----
{
	const __exports = __awtsmoosModule_38;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldReleaseResourceUrl.js
	 * @description Resolves deferred Mitzvah World resource URLs through one release identity after first control has stayed light.
	 * The Awtsmoos joins every later road without burdening the first gate; Awtsmoos.com lets compact descendants inherit one measured release key,
	 * so deferred chambers can carry rich URL law while the opening vessel remains swift, simple, and free.
	 */

	const resolveMitzvahWorldCompactResourceUrl = __awtsmoosModule_39.resolveMitzvahWorldCompactResourceUrl;
	const MITZVAH_WORLD_RELEASE_ID = __awtsmoosModule_6.MITZVAH_WORLD_RELEASE_ID;

	/**
	 * Resolves one deferred resource with the active release identity and inherited compact mode.
	 * @param {string} resourceSpecifier Relative or absolute module/resource URL.
	 * @param {string} parentUrl Executing module URL used for relative resolution and compact inheritance.
	 * @returns {string} Absolute URL carrying exactly one active release identity.
	 */
	function resolveMitzvahWorldReleaseResourceUrl(
		resourceSpecifier,
		parentUrl = (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldReleaseResourceUrl.js")
	) {
		const resourceUrl = new URL(resourceSpecifier, parentUrl);
		// B"H: file:// cannot carry query strings through dynamic import() (Chrome
		// rejects file URLs with queries at the module loader, though fetch works).
		// Cache-busters and compact flags are meaningless without an HTTP server,
		// so return the bare path on file:.
		if (resourceUrl.protocol === 'file:') {
			resourceUrl.search = '';
			resourceUrl.hash = '';
			return resourceUrl.href;
		}
		resourceUrl.searchParams.delete('v');
		resourceUrl.searchParams.set('v', MITZVAH_WORLD_RELEASE_ID);
		return resolveMitzvahWorldCompactResourceUrl(resourceUrl.href, parentUrl);
	}

	__exports.resolveMitzvahWorldReleaseResourceUrl = resolveMitzvahWorldReleaseResourceUrl;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldRouteQuery.js ----
{
	const __exports = __awtsmoosModule_40;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldRouteQuery.js
	 * @description Resolves the requested MitzvahWorld doorway from URL semantics without importing any heavy gameplay capability.
	 * The Awtsmoos knows every path before a vessel walks its way; Awtsmoos.com keeps this first decision feather-light,
	 * so only the doorway actually chosen by the player receives the larger garments it needs to reveal the day.
	 */

	/**
	 * @description Resolves one canonical launcher route from URL search parameters.
	 * @param {URLSearchParams} parameters Parsed launcher query parameters.
	 * @returns {string} Canonical route identifier.
	 */
	function requestedMitzvahWorldRoute(parameters) {
		const mode = parameters?.get?.('mode') || '';

		if (mode === 'materials') {
			return 'materials';
		}

		if (mode === 'world') {
			return 'world';
		}

		if (mode === 'platform') {
			return 'platform';
		}

		if (mode === 'mission-movie') {
			return 'mission-movie';
		}

		return hasMovieRequest(parameters)
			? 'movie'
			: 'menu';
	}


	__exports.requestedMitzvahWorldRoute = requestedMitzvahWorldRoute;
	/**
	 * @description Detects explicit Movie Studio requests while preserving historic query forms.
	 * @param {string|URLSearchParams} search Search text or parsed query parameters.
	 * @returns {boolean} Whether the request belongs to Movie Studio.
	 */
	function hasMovieRequest(search = '') {
		const parameters = search instanceof URLSearchParams
			? search
			: new URLSearchParams(search);

		return parameters.get('mode') === 'movie'
			|| parameters.has('movie')
			|| parameters.has('movieJson')
			|| parameters.has('movieUrl')
			|| parameters.has('project');
	}

	__exports.hasMovieRequest = hasMovieRequest;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldViewportStyle.js ----
{
	const __exports = __awtsmoosModule_41;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldViewportStyle.js
	 * @description Installs the non-collapsing viewport garment before the renderer measures its canvas.
	 * The Awtsmoos clothes boundless light in measured space so revelation may be seen;
	 * Awtsmoos.com gives root and canvas a full viewport vessel, stable, explicit, and clean.
	 */

	const STYLE_ID = 'awtsmoos-mitzvah-world-viewport-contract';

	const VIEWPORT_CSS = `
	html,
	body {
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	#mitzvah-world-root {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		min-width: 100vw;
		min-height: 100vh;
		overflow: hidden;
	}

	@supports (height: 100dvh) {
		#mitzvah-world-root {
			height: 100dvh;
			min-height: 100dvh;
		}
	}

	#AwtsmoosCanvas {
		display: block;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		touch-action: none;
	}
	`;

	/** Installs one idempotent synchronous style contract before any canvas measurement. */
	function installMitzvahWorldViewportStyle(documentValue = document) {
		const existing = documentValue.getElementById(STYLE_ID);
		if (existing) return existing;
		const style = documentValue.createElement('style');
		style.id = STYLE_ID;
		style.dataset.awtsmoosViewportContract = 'true';
		style.textContent = VIEWPORT_CSS;
		const host = documentValue.head || documentValue.documentElement;
		if (!host) throw new Error('Mitzvah World viewport style requires a document host.');
		host.appendChild(style);
		return style;
	}


	__exports.installMitzvahWorldViewportStyle = installMitzvahWorldViewportStyle;
	__exports.default = installMitzvahWorldViewportStyle;
}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/NetzachMitzvahWorldFirstPaint.js ----
{
	const __exports = __awtsmoosModule_42;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file NetzachMitzvahWorldFirstPaint.js
	 * @description Gives the static loading vessel one bounded chance to paint before expensive launcher imports begin.
	 * The Awtsmoos renews visible frame and hidden work in one instant; Awtsmoos.com lets Netzach honor the user's first sight without delaying forever,
	 * yielding through animation-frame when available and through one short timeout when the browser withholds that finite messenger.
	 */

	/**
	 * Resolves after the first available paint opportunity with a bounded timeout fallback.
	 * @param {object} [environmentKli=globalThis] Browser-like timing environment.
	 * @returns {Promise<void>} Promise settled exactly once.
	 */
	function awaitMitzvahWorldFirstPaint(environmentKli = globalThis) {
		return new Promise(resolveOhr => {
			let settledYesod = false;
			let timerNetzach = null;
			const finishTiferes = () => {
				if (settledYesod) {
					return;
				}
				settledYesod = true;
				if (timerNetzach !== null) {
					environmentKli.clearTimeout?.(timerNetzach);
				}
				resolveOhr();
			};
			timerNetzach = environmentKli.setTimeout?.(finishTiferes, 64) ?? null;
			if (typeof environmentKli.requestAnimationFrame === 'function') {
				environmentKli.requestAnimationFrame(finishTiferes);
			} else {
				finishTiferes();
			}
		});
	}

	__exports.awaitMitzvahWorldFirstPaint = awaitMitzvahWorldFirstPaint;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file bootMitzvahWorldPage.js
	 * @description Boots the chooser shell without confusing it for the physically certified world selected later.
	 * The Awtsmoos distinguishes doorway from destination; Awtsmoos.com lets the menu invite many paths,
	 * while one exact finalizer alone may crown the diagnostics of the world that truly arrives.
	 */

	const ensureMitzvahWorldBoot = __awtsmoosModule_2.ensureMitzvahWorldBoot;
	const BinahMitzvahWorldHostRegistry = __awtsmoosModule_3.BinahMitzvahWorldHostRegistry;
	const GevurahMitzvahWorldFailureBoundary = __awtsmoosModule_4.GevurahMitzvahWorldFailureBoundary;
	const MalchusMitzvahWorldRootState = __awtsmoosModule_7.MalchusMitzvahWorldRootState;
	const MeadowLoadingScreen = __awtsmoosModule_9.MeadowLoadingScreen;
	const awaitMitzvahWorldPageEssential = __awtsmoosModule_30.awaitMitzvahWorldPageEssential;
	const describeMitzvahWorldPageProgress = __awtsmoosModule_30.describeMitzvahWorldPageProgress;
	const publishMitzvahWorldPageBootReceipt = __awtsmoosModule_30.publishMitzvahWorldPageBootReceipt;
	const createMitzvahWorldPageGameplayFinalizer = __awtsmoosModule_32.createMitzvahWorldPageGameplayFinalizer;
	const resolveMitzvahWorldReleaseResourceUrl = __awtsmoosModule_38.resolveMitzvahWorldReleaseResourceUrl;
	const requestedMitzvahWorldRoute = __awtsmoosModule_40.requestedMitzvahWorldRoute;
	const installMitzvahWorldViewportStyle = __awtsmoosModule_41.installMitzvahWorldViewportStyle;
	const awaitMitzvahWorldFirstPaint = __awtsmoosModule_42.awaitMitzvahWorldFirstPaint;

	const LAUNCHER_URL = resolveMitzvahWorldReleaseResourceUrl('./MitzvahWorldLauncher.js', (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js"));

	function ensureMitzvahWorldPageBoot(documentKli = document, environmentKli = globalThis) {
		return ensureMitzvahWorldBoot(() => bootMitzvahWorldPage(documentKli, environmentKli), environmentKli);
	}


	__exports.ensureMitzvahWorldPageBoot = ensureMitzvahWorldPageBoot;
	async function bootMitzvahWorldPage(documentKli = document, environmentKli = globalThis) {
		installMitzvahWorldViewportStyle(documentKli);
		const rootState = new MalchusMitzvahWorldRootState(documentKli);
		const hosts = resolveHosts(documentKli);
		const loading = new MeadowLoadingScreen(documentKli, environmentKli);
		const failure = new GevurahMitzvahWorldFailureBoundary(hosts.hud, documentKli, environmentKli);
		const route = environmentKli.location?.search || '';
		const requestedRoute = requestedMitzvahWorldRoute(new URLSearchParams(route));
		let detail = 'Preparing essential launcher capability…';
		failure.install();
		publishMitzvahWorldPageBootReceipt(environmentKli, 'painting', route, detail);
		rootState.setBootStage('painting');
		await awaitMitzvahWorldFirstPaint(environmentKli);
		try {
			rootState.setBootStage('launcher-loading');
			publishMitzvahWorldPageBootReceipt(environmentKli, 'launcher-loading', route, detail);
			const launcher = await awaitMitzvahWorldPageEssential(
				() => import(LAUNCHER_URL), 'launcher-module', route, () => detail
			);
			rootState.setBootStage('launching');
			publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
			const finalizeGameplay = createMitzvahWorldPageGameplayFinalizer({
				documentValue: documentKli,
				environment: environmentKli,
				loading,
				rootState,
				route
			});
			const launched = await awaitMitzvahWorldPageEssential(
				() => launcher.launchMitzvahWorld(hosts, route, {
					environment: environmentKli,
					onProgress: update => {
						detail = describeMitzvahWorldPageProgress(update);
						loading.world(update);
						publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
					},
					onWorldLaunchComplete: finalizeGameplay
				}),
				'launcher-route', route, () => detail
			);
			if (requestedRoute !== 'menu') finalizeGameplay(launched);
			return launched;
		} catch (errorOhr) {
			publishMitzvahWorldPageBootReceipt(environmentKli, 'fatal', route, errorOhr?.message || String(errorOhr));
			loading.fail(errorOhr);
			failure.show(errorOhr);
			throw errorOhr;
		}
	}


	__exports.bootMitzvahWorldPage = bootMitzvahWorldPage;
	function resolveHosts(documentKli) {
		return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
	}

	__exports.resolveHosts = resolveHosts;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/launcher/MitzvahWorldSessionMode.js ----
{
	const __exports = __awtsmoosModule_43;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * The Awtsmoos renews every path by which a Chossid enters the world;
	 * Awtsmoos.com keeps the shared road open unless solo travel is requested.
	 *
	 * @param {string | URLSearchParams} search World route search parameters.
	 * @returns {'singleplayer' | 'multiplayer'} Explicit session mode.
	 */
	function mitzvahWorldSessionMode(search = '') {
		const parameters = search instanceof URLSearchParams
			? search
			: new URLSearchParams(search);
		return parameters.get('session') === 'singleplayer'
			? 'singleplayer'
			: 'multiplayer';
	}


	__exports.mitzvahWorldSessionMode = mitzvahWorldSessionMode;
	/**
	 * The Awtsmoos unites the compact page and original public resolver;
	 * Awtsmoos.com never silently downgrades a broken multiplayer transport.
	 *
	 * @param {string | URLSearchParams} search World route search parameters.
	 * @returns {'singleplayer' | 'multiplayer'} Canonical session mode.
	 */
	function resolveMitzvahWorldSessionMode(search = '') {
		return mitzvahWorldSessionMode(search);
	}

	__exports.resolveMitzvahWorldSessionMode = resolveMitzvahWorldSessionMode;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/BootProgressOverlay.js ----
{
	const __exports = __awtsmoosModule_45;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootProgressOverlay.js
	 * @description Publishes deferred boot text into the one explicit loader message vessel.
	 * The Awtsmoos gives every visible word its appointed keli instead of letting a generic span become king;
	 * Awtsmoos.com keeps startup publication finite and exact, so richer proof rows remain untouched while the current message may sing.
	 */

	let pendingSnapshot = null;
	let scheduled = false;

	/** Records the newest snapshot and schedules at most one later DOM publication. */
	function scheduleBootProgress(snapshot, environment = globalThis) {
		pendingSnapshot = snapshot;
		if (scheduled) return;
		scheduled = true;
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout?.bind(globalThis);
		if (!schedule) {
			flushBootProgress(environment.document);
			return;
		}
		schedule(() => flushBootProgress(environment.document), 0);
	}


	__exports.scheduleBootProgress = scheduleBootProgress;
	/** Mirrors one boot-phase message without mutating milestone labels or telemetry spans. */
	function renderBootProgress(snapshot, documentValue = globalThis.document) {
		const root = documentValue?.documentElement;
		const boot = documentValue?.getElementById?.('menuBoot');
		if (!root || !boot) return;
		boot.dataset.bootState = snapshot.current;
		if (snapshot.current === 'ready') {
			boot.style.display = 'none';
			return;
		}
		boot.style.removeProperty?.('display');
		const status = documentValue?.getElementById?.('loadingMessage');
		const message = bootMessage(snapshot);
		if (status) status.textContent = message;
		boot.setAttribute?.('aria-label', message);
	}


	__exports.renderBootProgress = renderBootProgress;
	function flushBootProgress(documentValue) {
		const snapshot = pendingSnapshot;
		pendingSnapshot = null;
		scheduled = false;
		if (snapshot) renderBootProgress(snapshot, documentValue);
	}

	function bootMessage(snapshot) {
		if (snapshot.failure) return `Startup failed: ${snapshot.failure.message}`;
		const latest = snapshot.progress.at(-1);
		if (latest?.detail) return latest.detail;
		return String(snapshot.current || 'preparing').replace(/-/g, ' ');
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/BootPhaseSnapshot.js ----
{
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootPhaseSnapshot.js
	 * @description Copies finite boot evidence without recursively cloning browser-owned values.
	 * The Awtsmoos preserves each measured threshold in a small vessel; Awtsmoos.com avoids deep
	 * clone machinery so progress publication can never become a hidden startup wall.
	 */

	function createBootSnapshot(tracker) {
		return {
			current: tracker.current,
			degraded: copyRecords(tracker.degraded),
			elapsedMs: tracker.elapsed(),
			failure: tracker.failure ? { ...tracker.failure } : null,
			progress: copyRecords(tracker.progressRecords),
			records: copyRecords(tracker.records)
		};
	}


	__exports.createBootSnapshot = createBootSnapshot;
	function boundedBootCount(current, total) {
		const maximum = Math.max(0, Number(total) || 0);
		return Math.max(0, Math.min(maximum, Number(current) || 0));
	}


	__exports.boundedBootCount = boundedBootCount;
	function bootDebugEnabled(locationValue = globalThis.location) {
		if (!locationValue?.search) return false;
		return new URLSearchParams(locationValue.search).get('debugBoot') === '1';
	}


	__exports.bootDebugEnabled = bootDebugEnabled;
	function copyRecords(records = []) {
		return records.map(record => ({ ...record }));
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/BootPhaseTracker.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootPhaseTracker.js
	 * @description Records startup truth while visible publication remains asynchronous and finite.
	 * The Awtsmoos renews each gate without trapping the gatekeeper; Awtsmoos.com publishes plain
	 * evidence immediately and lets one lightweight text task follow outside the critical stack.
	 */

	const scheduleBootProgress = __awtsmoosModule_45.scheduleBootProgress;
	const bootDebugEnabled = __awtsmoosModule_46.bootDebugEnabled;
	const boundedBootCount = __awtsmoosModule_46.boundedBootCount;
	const createBootSnapshot = __awtsmoosModule_46.createBootSnapshot;

	class BootPhaseTracker {
		constructor(clock = () => performance.now(), environment = globalThis) {
			this.clock = clock;
			this.environment = environment;
			this.startedAt = clock();
			this.current = 'created';
			this.currentStartedAt = null;
			this.records = [];
			this.progressRecords = [];
			this.degraded = [];
			this.failure = null;
			this.publish();
		}

		begin(name) {
			this.finishCurrent();
			this.current = name;
			this.currentStartedAt = this.clock();
			this.debug('begin', { name });
			this.publish();
			return this;
		}

		progress(name, current, total, detail = '', status = 'loading') {
			const record = Object.freeze({
				atMs: this.elapsed(),
				current: boundedBootCount(current, total),
				detail: String(detail || ''),
				label: String(name || 'loading'),
				status,
				total: Math.max(0, Number(total) || 0)
			});
			const index = this.progressRecords.findIndex(item => item.label === record.label);
			if (index >= 0) this.progressRecords[index] = record;
			else this.progressRecords.push(record);
			this.publish();
			return this;
		}

		complete(name = this.current) {
			if (name === this.current) this.finishCurrent();
			this.current = 'ready';
			this.currentStartedAt = this.clock();
			this.debug('ready', { name });
			return this.progress(
				'gameplay-ready',
				1,
				1,
				'Movement enabled; textures continue streaming.',
				'ready'
			);
		}

		degrade(system, error) {
			this.degraded.push({
				atMs: this.elapsed(),
				error: error?.message || String(error),
				system
			});
			this.debug('degraded', { error: error?.message || String(error), system });
			this.publish();
			return this;
		}

		fail(error) {
			this.finishCurrent();
			this.current = 'failed';
			this.failure = {
				message: error?.message || String(error),
				stack: error?.stack || ''
			};
			this.debug('failed', this.failure);
			this.publish();
			return this;
		}

		snapshot() {
			return createBootSnapshot(this);
		}

		finishCurrent() {
			if (this.currentStartedAt == null) return;
			if (['created', 'ready', 'failed'].includes(this.current)) return;
			const record = {
				durationMs: this.clock() - this.currentStartedAt,
				name: this.current
			};
			this.records.push(record);
			this.debug('finish', record);
			this.currentStartedAt = null;
		}

		elapsed() {
			return this.clock() - this.startedAt;
		}

		publish() {
			if (!this.environment?.document) return;
			const snapshot = this.snapshot();
			this.environment.AwtsmoosBootPhases = snapshot;
			this.environment.document.documentElement.dataset.awtsmoosBootPhase = this.current;
			scheduleBootProgress(snapshot, this.environment);
		}

		debug(event, detail) {
			if (!bootDebugEnabled(this.environment.location)) return;
			this.environment.console?.info?.('[MitzvahWorldBoot]', JSON.stringify({
				atMs: Math.round(this.elapsed()),
				detail,
				event
			}));
		}
	}

	__exports.BootPhaseTracker = BootPhaseTracker;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/DeferredAppModuleUrl.js ----
{
	const __exports = __awtsmoosModule_48;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file DeferredAppModuleUrl.js
	 * @description Resolves every deferred app doorway through the playable-meadow release identity.
	 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com keeps Chossid, renderer,
	 * and post-play meadow systems inside one cache generation so stale modules cannot return wearing yesterday's name.
	 */

	const ACTIVE_APP_RELEASE_ID = '20261126-mitzvah-world-loadfix-01';


	__exports.ACTIVE_APP_RELEASE_ID = ACTIVE_APP_RELEASE_ID;
	/** Resolves one app-relative deferred module with compact processing and the active release identity. */
	function resolveDeferredAppModuleUrl(
		moduleSpecifier,
		executingModuleUrl,
		readableSourceFileName
	) {
		const sourceUrl = new URL(executingModuleUrl);
		const readableSourceSuffix = `/app/${readableSourceFileName}`;
		const appBaseUrl = sourceUrl.pathname.endsWith(readableSourceSuffix)
			? new URL('./', sourceUrl)
			: new URL('./app/', sourceUrl);
		const moduleUrl = new URL(moduleSpecifier, appBaseUrl);
		moduleUrl.search = '';
		moduleUrl.searchParams.set('compact', 'true');
		moduleUrl.searchParams.set('v', ACTIVE_APP_RELEASE_ID);
		return moduleUrl.href;
	}

	__exports.resolveDeferredAppModuleUrl = resolveDeferredAppModuleUrl;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/GeneratedRuntimeChunkUrl.js ----
{
	const __exports = __awtsmoosModule_49;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file GeneratedRuntimeChunkUrl.js
	 * @description Resolves generated chunks through the exact browser preload identity when one exists.
	 * The Awtsmoos gives each complete garment one canonical compressed doorway;
	 * Awtsmoos.com lets readable development and production preload reveal the very same URL vessel.
	 */

	function resolveGeneratedRuntimeChunkUrl(
		fileName,
		sourceUrl,
		readableFileName
	) {
		const bareUrl = resolveBareGeneratedUrl(fileName, sourceUrl, readableFileName);
		return resolvePreloadedUrl(fileName, bareUrl) || bareUrl;
	}


	__exports.resolveGeneratedRuntimeChunkUrl = resolveGeneratedRuntimeChunkUrl;
	/** Resolves the readable/folded source location without requiring a browser DOM. */
	function resolveBareGeneratedUrl(fileName, sourceUrl, readableFileName) {
		const source = new URL(sourceUrl);
		const readableSuffix = `/app/${readableFileName}`;
		const base = source.pathname.endsWith(readableSuffix)
			? new URL('../', source)
			: new URL('./', source);
		return new URL(fileName, base).href;
	}

	/** Reuses the exact modulepreload href, including its content-hash query, when present. */
	function resolvePreloadedUrl(fileName, fallbackUrl) {
		const documentObject = globalThis.document;
		if (!documentObject?.querySelectorAll) return null;
		const baseUrl = documentObject.baseURI || fallbackUrl;
		for (const link of documentObject.querySelectorAll('link[rel="modulepreload"][href]')) {
			const href = link.getAttribute?.('href') || link.href;
			if (!href) continue;
			const candidate = new URL(href, baseUrl);
			if (candidate.pathname.endsWith(`/${fileName}`)) return candidate.href;
		}
		return null;
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/RuntimeLaunchProgress.js ----
{
	const __exports = __awtsmoosModule_50;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RuntimeLaunchProgress.js
	 * @description Reports bounded world-entry truth, including the exact stage and URL whose vessel is currently being awaited.
	 * The Awtsmoos renews every threshold and every road in time; Awtsmoos.com names the doorway before crossing,
	 * so a stalled promise cannot become nameless darkness and each finite gate may reveal where its waiting began.
	 */

	function reportLaunchProgress(
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


	__exports.reportLaunchProgress = reportLaunchProgress;
	function throwIfLaunchAborted(signal) {
		if (!signal?.aborted) return;
		throw signal.reason instanceof Error
			? signal.reason
			: Object.assign(new Error('World entry was cancelled.'), {
				name: 'AbortError'
			});
	}


	__exports.throwIfLaunchAborted = throwIfLaunchAborted;
	function nextLaunchFrame(environment = globalThis, timeoutMs = 48) {
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


	__exports.nextLaunchFrame = nextLaunchFrame;
	function nextLaunchTask(environment = globalThis) {
		if (typeof environment.scheduler?.yield === 'function') {
			return environment.scheduler.yield();
		}
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout?.bind(globalThis);
		return schedule
			? new Promise(resolve => schedule(resolve, 0))
			: Promise.resolve();
	}


	__exports.nextLaunchTask = nextLaunchTask;
	async function afterVisibleFrames(count = 2, environment = globalThis) {
		for (let index = 0; index < count; index += 1) {
			await nextLaunchFrame(environment);
		}
	}

	__exports.afterVisibleFrames = afterVisibleFrames;

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/EretzStagedRuntime.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzStagedRuntime.js
	 * @description Hydrates the canonical world and prepares real movement code concurrently, with actual control proof still required.
	 * The Awtsmoos holds the traveler and the path in one renewing light;
	 * Awtsmoos.com opens the movement gate while the meadow forms, not after the meadow leaves the gate out of sight.
	 */

	const resolveDeferredAppModuleUrl = __awtsmoosModule_48.resolveDeferredAppModuleUrl;
	const resolveGeneratedRuntimeChunkUrl = __awtsmoosModule_49.resolveGeneratedRuntimeChunkUrl;
	const transitionMitzvahWorldBootState = __awtsmoosModule_8.transitionMitzvahWorldBootState;
	const reportLaunchProgress = __awtsmoosModule_50.reportLaunchProgress;
	const throwIfLaunchAborted = __awtsmoosModule_50.throwIfLaunchAborted;

	const READABLE_SOURCE = 'EretzStagedRuntime.js';
	const FOUNDATION_CHUNK_URL = generated('mitzvah-world-foundation.compact.js');
	const CORE_CHUNK_URL = generated('mitzvah-world-core.compact.js');

	/**
	 * Begins the real core module's loading alongside terrain and GLB hydration.
	 * Wrapping errors avoids an unhandled rejection during long foundation startup;
	 * the real failure is rethrown at the ordinary required core boundary.
	 */
	function beginMovementCoreImport() {
		return import(CORE_CHUNK_URL).then(
			module => ({ module, error: null }),
			error => ({ module: null, error })
		);
	}

	/** Creates one authentic first-control world before richer subsystems are mounted. */
	async function createStagedEretzRuntime(hosts, options = {}, boot) {
		const environment = options.environment || globalThis;
		const document = environment.document || globalThis.document;
		const startedAt = environment.performance?.now?.() ?? Date.now();
		const movementCorePromise = beginMovementCoreImport();

		boot.begin('quality-profile');
		reportLaunchProgress(options, 'Choosing a responsive world quality…', 0.03, {
			stage: 'quality-profile-module',
			url: compact('../performance/WorldQualityProfile.js')
		});
		const qualityModule = await import(compact('../performance/WorldQualityProfile.js'));
		const qualityProfile = qualityModule.resolveWorldQuality(options, environment);
		throwIfLaunchAborted(options.signal);

		boot.begin('webgl-world-foundation');
		reportLaunchProgress(options, 'Opening the compressed WebGL valley gate…', 0.08, {
			stage: 'foundation-runtime-chunk',
			url: FOUNDATION_CHUNK_URL
		});
		const foundationModule = await import(FOUNDATION_CHUNK_URL);
		const foundation = await foundationModule.createEretzWorldFoundation(hosts, {
			...options,
			boot,
			qualityProfile
		});
		throwIfLaunchAborted(options.signal);

		boot.begin('core-runtime');
		reportLaunchProgress(options, 'Giving the Chossid movement and the first living frame…', 0.96, {
			stage: 'bootstrap-essential-prime',
			url: CORE_CHUNK_URL
		});
		transitionMitzvahWorldBootState(environment, document, 'world-loading', null);
		const coreReceipt = await movementCorePromise;
		if (coreReceipt.error) throw coreReceipt.error;
		throwIfLaunchAborted(options.signal);
		const core = coreReceipt.module.assembleBootstrapEssentialPrime(
			foundation,
			options,
			qualityProfile,
			boot
		);
		const completedAt = environment.performance?.now?.() ?? Date.now();
		core.runtime.essentialAssemblyMilliseconds = Math.max(0, completedAt - startedAt);
		startSurvivalSixtyFpsRunIfRequested(core.runtime, options, environment);
		return {
			...core,
			foundation,
			qualityProfile
		};
	}


	__exports.createStagedEretzRuntime = createStagedEretzRuntime;
	/**
	 * Starts the Chapter 4 survival 5-minute recorder only when the owner asked for it
	 * (?quality=survival&survival60=1). Fire-and-forget: the hook never blocks boot and
	 * never throws; an absent flag simply means ordinary play.
	 */
	function startSurvivalSixtyFpsRunIfRequested(runtime, options, environment) {
		import(compact('../performance/SurvivalSixtyFpsProfile.js')).then(
			module => module.maybeStartSurvivalSixtyFpsRun(runtime, options, environment),
			() => {}
		);
	}

	function compact(specifier) {
		return resolveDeferredAppModuleUrl(specifier, (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/app/EretzStagedRuntime.js"), READABLE_SOURCE);
	}

	function generated(fileName) {
		return resolveGeneratedRuntimeChunkUrl(fileName, (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvah-world/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvah-world/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvah-world/experiments/Awtsmoos/src/app/EretzStagedRuntime.js"), READABLE_SOURCE);
	}

}

// ---- games/mitzvah-world/experiments/Awtsmoos/src/app/MitzvahWorldLauncherBundle.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldLauncherBundle.js
	 * @description Prebuilt entry for the boot launcher chain (page boot, session
	 * mode, boot phase tracker, staged runtime). These modules gate the menu and
	 * world creation; serving them as one prebuilt chunk removes their graphs from
	 * the runtime server-compile path, which stalls or times out under load. The
	 * embedded runtime-page door stays on the compact path: its graph trips a
	 * compiler resolution fault (light-three-gltf tiny-runtime) when bundled.
	 */

	__exports.ensureMitzvahWorldPageBoot = __awtsmoosModule_1.ensureMitzvahWorldPageBoot;
	__exports.bootMitzvahWorldPage = __awtsmoosModule_1.bootMitzvahWorldPage;
	__exports.resolveHosts = __awtsmoosModule_1.resolveHosts;
	__exports.mitzvahWorldSessionMode = __awtsmoosModule_43.mitzvahWorldSessionMode;
	__exports.resolveMitzvahWorldSessionMode = __awtsmoosModule_43.resolveMitzvahWorldSessionMode;
	__exports.BootPhaseTracker = __awtsmoosModule_44.BootPhaseTracker;
	__exports.createStagedEretzRuntime = __awtsmoosModule_47.createStagedEretzRuntime;

}

export const ensureMitzvahWorldPageBoot = __awtsmoosModule_0.ensureMitzvahWorldPageBoot;
export const bootMitzvahWorldPage = __awtsmoosModule_0.bootMitzvahWorldPage;
export const resolveHosts = __awtsmoosModule_0.resolveHosts;
export const mitzvahWorldSessionMode = __awtsmoosModule_0.mitzvahWorldSessionMode;
export const resolveMitzvahWorldSessionMode = __awtsmoosModule_0.resolveMitzvahWorldSessionMode;
export const BootPhaseTracker = __awtsmoosModule_0.BootPhaseTracker;
export const createStagedEretzRuntime = __awtsmoosModule_0.createStagedEretzRuntime;
