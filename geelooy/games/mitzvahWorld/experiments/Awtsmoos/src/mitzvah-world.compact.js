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
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MinimalSharedMeadowPage.js
	 * @description Resolves compact launcher doors through the authored-meadow release identity while preserving deferred public surfaces.
	 * The Awtsmoos gives the first instant one truthful mark before distant chambers enter the sea; Awtsmoos.com keeps every launcher
	 * child on one authored-visual covenant so a phone cannot mix the repaired GLTF and meadow policy with older cached modules.
	 */

	const BUILD_VERSION = '20260915-authored-meadow-03';
	const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';
	const SOURCE_URL = new URL((( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js"));
	const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
		? new URL('./', SOURCE_URL)
		: new URL('./launcher/', SOURCE_URL);
	const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');

	markCompactScriptStart(globalThis);

	/** Boots the canonical Mitzvah World page once through the compact page launcher. */
	async function bootMinimalSharedMeadowPage(documentValue = document, environment = globalThis) {
		markCompactScriptStart(environment);
		const module = await import(PAGE_BOOT_URL);
		return module.ensureMitzvahWorldPageBoot(documentValue, environment);
	}


	__exports.bootMinimalSharedMeadowPage = bootMinimalSharedMeadowPage;
	/** Boots only the shared meadow runtime for embedded or verification surfaces. */
	async function bootMinimalSharedMeadowRuntimePage(hosts, options = {}, environment = globalThis) {
		markCompactScriptStart(environment);
		const module = await import(launcherModuleUrl('MinimalSharedMeadowRuntimePage.js'));
		return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
	}


	__exports.bootMinimalSharedMeadowRuntimePage = bootMinimalSharedMeadowRuntimePage;
	/** Resolves the public route/session mode through the same compact launcher boundary. */
	async function resolveMinimalSharedMeadowSessionMode(search = '') {
		const module = await import(launcherModuleUrl('MitzvahWorldSessionMode.js'));
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

	/** Resolves one first-control launcher URL with compact and release-cache identities in canonical order. */
	function launcherModuleUrl(fileName) {
		return new URL(`${fileName}?compact=true&v=${BUILD_VERSION}`, LAUNCHER_BASE).href;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowCompactBootstrap.js
	 * @description Keeps first control tiny while sharing essential boot truth and leaving release certification beyond an opaque dynamic boundary.
	 * The Awtsmoos gives the doorway one swift spark before deeper vessels unfold;
	 * Awtsmoos.com keeps ordinary travel light while an explicit release query may summon its examiner without letting CompactJS swallow that world whole.
	 */

	const bootMinimalSharedMeadowPage = __awtsmoosModule_1.bootMinimalSharedMeadowPage;

	const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
	const ENTRY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';
	const ESSENTIAL = new URL('./app/MitzvahWorldEssentialBoot.js', (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js")).href;
	const RELEASE = new URL('./app/MitzvahWorldReleaseGateSession.js', (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js")).href;

	publish('loading');
	const bootPromise = boot();
	globalThis.AwtsmoosMitzvahWorldBootPromise = bootPromise;
	if (globalThis.location?.search?.includes('releaseGate=1')) {
		import(RELEASE)
			.then(module => module.startMitzvahWorldReleaseGateSession(globalThis))
			.catch(report);
	}

	/** Proves entry through the shared ledger before opening canonical page boot. */
	async function boot() {
		try {
			const essential = await import(ESSENTIAL);
			essential.initializeMitzvahWorldEssentialBoot(globalThis);
			essential.completeMitzvahWorldEssentialMilestone(
				globalThis,
				essential.ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
				{ importerStage: 'compact-entry-body', resourceUrl: ENTRY }
			);
			const result = await bootMinimalSharedMeadowPage();
			publish('loaded');
			return result;
		} catch (error) {
			publish('failed', error);
			report(error);
			throw error;
		}
	}

	/** Publishes immutable entry evidence and mirrors state on the root. */
	function publish(state, error = null) {
		const receipt = Object.freeze({
			entry: ENTRY,
			error: error ? {
				message: error?.message || String(error),
				name: error?.name || 'Error'
			} : null,
			state
		});
		if (ROOT) ROOT.dataset.awtsmoosEntry = state;
		globalThis.AwtsmoosMitzvahWorldBoot = receipt;
	}

	/** Reports failed asynchronous boot or optional examiner launch without swallowing evidence. */
	function report(error) {
		globalThis.AwtsmoosMitzvahWorldReleaseGateLaunchFailure = Object.freeze({
			message: error?.message || String(error),
			name: error?.name || 'Error'
		});
		if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
		else globalThis.console?.error?.('B"H MitzvahWorld boot failed.', error);
	}

}
