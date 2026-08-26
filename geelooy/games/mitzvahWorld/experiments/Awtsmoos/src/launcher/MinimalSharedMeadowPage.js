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
const SOURCE_URL = new URL(import.meta.url);
const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
	? new URL('./', SOURCE_URL)
	: new URL('./launcher/', SOURCE_URL);
const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');

/** Boots the canonical MitzvahWorld page once through the compact page launcher. */
export async function bootMinimalSharedMeadowPage(
	documentValue = document,
	environment = globalThis
) {
	const module = await import(PAGE_BOOT_URL);
	return module.ensureMitzvahWorldPageBoot(documentValue, environment);
}

/** Boots only the shared meadow runtime for embedded or test surfaces. */
export async function bootMinimalSharedMeadowRuntimePage(
	hosts,
	options = {},
	environment = globalThis
) {
	const module = await import(RUNTIME_BOOT_URL);
	return module.bootMinimalSharedMeadowRuntimePage(hosts, options, environment);
}

/** Resolves the public route/session mode with the same compact launcher boundary. */
export async function resolveMinimalSharedMeadowSessionMode(search = '') {
	const module = await import(SESSION_MODE_URL);
	return module.resolveMitzvahWorldSessionMode(search);
}

function launcherModuleUrl(fileName) {
	const moduleUrl = new URL(fileName, LAUNCHER_BASE);
	moduleUrl.searchParams.set('compact', 'true');
	moduleUrl.searchParams.set('v', BUILD_VERSION);
	return moduleUrl.href;
}
