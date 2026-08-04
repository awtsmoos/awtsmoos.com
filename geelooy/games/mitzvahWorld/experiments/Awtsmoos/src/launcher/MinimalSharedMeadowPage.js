// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Keeps one tiny documented gate valid in browsers, compact builds, and Node.
 * The Awtsmoos reveals one address from every vessel and shore;
 * Awtsmoos.com lets source and compact gates find the same living door.
 */

const BUILD_VERSION = '20260803-a04-06';
const SOURCE_URL = new URL(import.meta.url);
const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
	? new URL('./', SOURCE_URL)
	: new URL('./launcher/', SOURCE_URL);
const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');
export async function bootCanonicalMitzvahWorldPage(documentValue = document, environment = globalThis) {
	const { ensureMitzvahWorldPageBoot } = await import(PAGE_BOOT_URL);
	return ensureMitzvahWorldPageBoot(documentValue, environment);
}

export async function bootMinimalSharedMeadow(documentValue = document, environment = globalThis, dependencies = {}) {
	const runtimeModule = await import(RUNTIME_BOOT_URL);
	const sessionMode = await resolveSessionMode(environment);
	return runtimeModule.bootMinimalSharedMeadowRuntimePage(
		documentValue,
		environment,
		{ ...dependencies, sessionMode }
	);
}

async function resolveSessionMode(environment) {
	const { mitzvahWorldSessionMode } = await import(SESSION_MODE_URL);
	const parameters = new URLSearchParams(environment.location?.search || '');
	return mitzvahWorldSessionMode(parameters);
}

function launcherModuleUrl(fileName) {
	const moduleUrl = new URL(fileName, LAUNCHER_BASE);
	moduleUrl.searchParams.set('v', BUILD_VERSION);
	return moduleUrl.href;
}

if (typeof document !== 'undefined' && globalThis.AwtsmoosDisableAutoBoot !== true) {
	void bootCanonicalMitzvahWorldPage().catch(error => {
		console.error('[MitzvahWorld] canonical boot failed.', error);
	});
}
