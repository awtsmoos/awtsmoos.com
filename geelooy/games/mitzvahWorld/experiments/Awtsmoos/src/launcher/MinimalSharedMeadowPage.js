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
const SOURCE_URL = new URL(import.meta.url);
const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
	? new URL('./', SOURCE_URL)
	: new URL('./launcher/', SOURCE_URL);
const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');

markCompactScriptStart(globalThis);

/** Boots the canonical MitzvahWorld page once through the compact page launcher. */
export async function bootMinimalSharedMeadowPage(
	documentValue = document,
	environment = globalThis
) {
	markCompactScriptStart(environment);
	const module = await import(PAGE_BOOT_URL);
	return module.ensureMitzvahWorldPageBoot(documentValue, environment);
}

/** Boots only the shared meadow runtime for embedded or test surfaces. */
export async function bootMinimalSharedMeadowRuntimePage(
	hosts,
	options = {},
	environment = globalThis
) {
	markCompactScriptStart(environment);
	const module = await import(RUNTIME_BOOT_URL);
	return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
}

/** Resolves the public route/session mode through the same compact launcher boundary. */
export async function resolveMinimalSharedMeadowSessionMode(search = '') {
	const module = await import(SESSION_MODE_URL);
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

function launcherModuleUrl(fileName) {
	const moduleUrl = new URL(fileName, LAUNCHER_BASE);
	moduleUrl.searchParams.set('compact', 'true');
	moduleUrl.searchParams.set('v', BUILD_VERSION);
	return moduleUrl.href;
}
