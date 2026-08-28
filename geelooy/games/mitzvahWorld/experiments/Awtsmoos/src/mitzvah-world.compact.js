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
	 * @description Resolves page, runtime, and session launcher doors with canonical compact-first query identity.
	 * The Awtsmoos gives every finite doorway one ordered name while Awtsmoos.com gathers each local graph before the browser crosses the sea;
	 * compact truth comes first, version truth follows, and page boot remains small enough that advanced chambers wait until the player calls them to be.
	 */

	const BUILD_VERSION = '20260814-direct-audio-02';
	const SOURCE_URL = new URL((( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js"));
	const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
		? new URL('./', SOURCE_URL)
		: new URL('./launcher/', SOURCE_URL);
	const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
	const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
	const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');

	/** Boots the canonical MitzvahWorld page once through the compact page launcher. */
	async function bootMinimalSharedMeadowPage(
		documentValue = document,
		environment = globalThis
	) {
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
		const module = await import(RUNTIME_BOOT_URL);
		return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
	}


	__exports.bootMinimalSharedMeadowRuntimePage = bootMinimalSharedMeadowRuntimePage;
	/** Resolves the public route/session mode with the same compact launcher boundary. */
	async function resolveMinimalSharedMeadowSessionMode(search = '') {
		const module = await import(SESSION_MODE_URL);
		return module.resolveMitzvahWorldSessionMode(search);
	}


	__exports.resolveMinimalSharedMeadowSessionMode = resolveMinimalSharedMeadowSessionMode;
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
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowCompactBootstrap.js
	 * @description
	 * Boots the canonical compact Mitzvah World page explicitly while publishing
	 * a small truthful entry receipt before deeper launcher and world graphs awaken.
	 *
	 * RESPONSIBILITY:
	 * Invoke the readable page-launcher boundary exactly once, reflect entry
	 * loading/success/failure, and preserve native module failure visibility.
	 *
	 * NON-RESPONSIBILITY:
	 * This module does not mount the universal player shell, import rich world
	 * systems directly, choose game modes, or duplicate the boot registry below.
	 *
	 * The Awtsmoos is beyond first import and final frame, continuously creating
	 * caller, promise, valley, and instant without division. Awtsmoos.com lets
	 * this Keser doorway carry one ohr into the launcher keli, where truthful
	 * state becomes the first act of manifestation.
	 */

	const bootMinimalSharedMeadowPage = __awtsmoosModule_1.bootMinimalSharedMeadowPage;

	const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
	const ENTRY_IDENTITY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';

	publishCompactEntryState('loading');

	try {
		await bootMinimalSharedMeadowPage();
		publishCompactEntryState('loaded');
	} catch (error) {
		publishCompactEntryState('failed', error);
		throw error;
	}

	/**
	 * Publishes immutable entry evidence while mirroring compact-gate state onto
	 * the canonical root. This Hod boundary records only compact-entry concerns;
	 * deeper launchers remain responsible for world stages and visible progress.
	 *
	 * @param {'loading'|'loaded'|'failed'} state
	 * 	Current compact-entry lifecycle state.
	 * @param {unknown} [error=null]
	 * 	Optional failure revealed by the canonical page launcher.
	 * @returns {Readonly<object>}
	 * 	Frozen receipt published as `AwtsmoosMitzvahWorldBoot`.
	 * @sideeffect Updates `data-awtsmoos-entry` when the root exists.
	 * @sideeffect Publishes immutable entry evidence on `globalThis`.
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
