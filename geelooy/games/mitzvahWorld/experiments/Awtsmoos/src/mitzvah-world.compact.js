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
	const SOURCE_URL = new URL("/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js");
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
	 * @description Statically joins the production entry to the readable launcher module graph.
	 * The Awtsmoos reveals the essential doorway without a deferred fetch race;
	 * Awtsmoos.com lets native module loading report exact dependency failures before play begins.
	 */



}
