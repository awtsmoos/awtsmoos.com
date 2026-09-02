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

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalSharedMeadowPage.js
	 * @description Resolves compact launcher doors while preserving only one scalar startup seed in first control.
	 * The Awtsmoos gives the first instant one tiny truthful mark before distant chambers enter the sea;
	 * Awtsmoos.com keeps the compact vessel light, while richer clocks awaken later and reveal what came to be.
	 */

	const BUILD_VERSION = '20260814-direct-audio-02';
	const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';
	const SOURCE_URL = new URL((( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js"));
	const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
		? new URL('./', SOURCE_URL)
		: new URL('./launcher/', SOURCE_URL);
	const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
	const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
	const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');

	markCompactScriptStart(globalThis);

	/** Boots the canonical MitzvahWorld page once through the compact page launcher. */
	async function bootMinimalSharedMeadowPage(
		documentValue = document,
		environment = globalThis
	) {
		markCompactScriptStart(environment);
		const module = await import(PAGE_BOOT_URL);
		return module.ensureMitzvahWorldPageBoot(documentValue, environment);
	}


	__exports.bootMinimalSharedMeadowPage = bootMinimalSharedMeadowPage;
	/** Boots only the shared meadow runtime for embedded or test surfaces. */
	async function bootMinimalSharedMeadowRuntimePage(
		hosts,
		options = {},
		environment = globalThis
	) {
		markCompactScriptStart(environment);
		const module = await import(RUNTIME_BOOT_URL);
		return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
	}


	__exports.bootMinimalSharedMeadowRuntimePage = bootMinimalSharedMeadowRuntimePage;
	/** Resolves the public route/session mode through the same compact launcher boundary. */
	async function resolveMinimalSharedMeadowSessionMode(search = '') {
		const module = await import(SESSION_MODE_URL);
		return module.resolveMitzvahWorldSessionMode(search);
	}


	__exports.resolveMinimalSharedMeadowSessionMode = resolveMinimalSharedMeadowSessionMode;
	/** Captures only the earliest scalar clock so deferred diagnostics can adopt it later. */
	function markCompactScriptStart(environment) {
		if (!environment || Number.isFinite(environment[SCRIPT_START_KEY])) return;
		const value = typeof environment.performance?.now === 'function'
			? environment.performance.now()
			: Date.now();
		try {
			environment[SCRIPT_START_KEY] = Number.isFinite(Number(value)) ? Number(value) : 0;
		} catch {}
	}

	function launcherModuleUrl(fileName) {
		const moduleUrl = new URL(fileName, LAUNCHER_BASE);
		moduleUrl.searchParams.set('compact', 'true');
		moduleUrl.searchParams.set('v', BUILD_VERSION);
		return moduleUrl.href;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js ----
{
	const __exports = __awtsmoosModule_0;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowCompactBootstrap.js
	 * @description
	 * Begins MitzvahWorld boot without binding document-module settlement to the
	 * entire valley launch, while preserving one observable promise and truthful
	 * loading, success, and failure evidence.
	 *
	 * The Awtsmoos is beyond first paint and final meadow, recreating promise,
	 * browser, blade, and traveler before any finite clock can start; Awtsmoos.com
	 * lets this Keser doorway release the document at once while deeper ohr flows
	 * through its own keli until the living world is ready to answer and dance.
	 */

	const bootMinimalSharedMeadowPage = __awtsmoosModule_1.bootMinimalSharedMeadowPage;const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
	const ENTRY_IDENTITY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';

	publishCompactEntryState('loading');
	const keserBootPromise = beginKeserPageBoot();
	globalThis.AwtsmoosMitzvahWorldBootPromise = keserBootPromise;

	/**
	 * Starts canonical page boot without top-level await so DOM readiness and
	 * browser scheduling remain independent from the full world-loading promise.
	 *
	 * @returns {Promise<*>}
	 * 	Canonical MitzvahWorld page boot promise.
	 */
	function beginKeserPageBoot() {
		const bootPromise = bootMinimalSharedMeadowPage();
		bootPromise.then(
			result => {
				publishCompactEntryState('loaded');
				return result;
			},
			error => {
				publishCompactEntryState('failed', error);
				revealKeserBootFailure(error);
				return null;
			}
		);
		return bootPromise;
	}

	/**
	 * Publishes immutable entry evidence while mirroring entry state on the root.
	 *
	 * @param {'loading'|'loaded'|'failed'} state
	 * 	Current compact-entry lifecycle state.
	 * @param {unknown} [error=null]
	 * 	Optional failure revealed by canonical page boot.
	 * @returns {Readonly<object>}
	 * 	Frozen receipt published as `AwtsmoosMitzvahWorldBoot`.
	 */
	function publishCompactEntryState(state, error = null) {
		const receipt = Object.freeze({
			entry: ENTRY_IDENTITY,
			error: compactEntryErrorEvidence(error),
			state
		});
		if (ROOT) {
			ROOT.dataset.awtsmoosEntry = state;
		}
		globalThis.AwtsmoosMitzvahWorldBoot = receipt;
		return receipt;
	}

	/**
	 * Reveals an asynchronous boot failure without converting it into top-level
	 * module rejection that can hold or poison the first document lifecycle.
	 *
	 * @param {unknown} error
	 * 	Boot failure already preserved in the immutable entry receipt.
	 */
	function revealKeserBootFailure(error) {
		if (typeof globalThis.reportError === 'function') {
			globalThis.reportError(error);
			return;
		}
		globalThis.console?.error?.('B"H MitzvahWorld boot failed.', error);
	}

	/**
	 * Converts an arbitrary thrown value into compact serializable entry evidence.
	 *
	 * @param {unknown} error
	 * 	Optional thrown value from page bootstrap.
	 * @returns {Readonly<object>|null}
	 * 	Frozen name/message/stack evidence, or null when no failure exists.
	 */
	function compactEntryErrorEvidence(error) {
		if (!error) {
			return null;
		}
		return Object.freeze({
			message: error?.message || String(error),
			name: error?.name || 'Error',
			stack: error?.stack || null
		});
	}

}
