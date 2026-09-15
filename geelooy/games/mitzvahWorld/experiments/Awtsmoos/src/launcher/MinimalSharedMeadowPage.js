//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Resolves compact launcher doors through one fresh mobile-loader release identity while preserving deferred public surfaces.
 * The Awtsmoos gives the first instant one truthful mark before distant chambers enter the sea; Awtsmoos.com keeps every launcher
 * child on the Sep-15 veil covenant so a phone cannot mix a repaired entry with a stale deferred world doorway from an earlier cache.
 */

const BUILD_VERSION = '20260915-mobile-loader-veil-01';
const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';
const SOURCE_URL = new URL(import.meta.url);
const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
	? new URL('./', SOURCE_URL)
	: new URL('./launcher/', SOURCE_URL);
const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');

markCompactScriptStart(globalThis);

/** Boots the canonical Mitzvah World page once through the compact page launcher. */
export async function bootMinimalSharedMeadowPage(documentValue = document, environment = globalThis) {
	markCompactScriptStart(environment);
	const module = await import(PAGE_BOOT_URL);
	return module.ensureMitzvahWorldPageBoot(documentValue, environment);
}

/** Boots only the shared meadow runtime for embedded or verification surfaces. */
export async function bootMinimalSharedMeadowRuntimePage(hosts, options = {}, environment = globalThis) {
	markCompactScriptStart(environment);
	const module = await import(launcherModuleUrl('MinimalSharedMeadowRuntimePage.js'));
	return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
}

/** Resolves the public route/session mode through the same compact launcher boundary. */
export async function resolveMinimalSharedMeadowSessionMode(search = '') {
	const module = await import(launcherModuleUrl('MitzvahWorldSessionMode.js'));
	return module.resolveMitzvahWorldSessionMode(search);
}

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
