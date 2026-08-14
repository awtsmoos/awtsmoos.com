/* B\"H compact live import helpers */
function __awtsmoosLiveImport(getModule, name) {
  const read = () => {
    const module = getModule();
    return module && module[name];
  };
  return new Proxy(function __awtsmoosLiveBinding(...args) {
    const value = read();
    if (typeof value !== "function") return value;
    return value(...args);
  }, {
    apply(_target, thisArg, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a function");
      return Reflect.apply(value, thisArg, args);
    },
    construct(_target, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a constructor");
      return Reflect.construct(value, args);
    },
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) return () => read();
      if (prop === "valueOf") return () => read();
      if (prop === "toString") return () => String(read());
      const value = read();
      return value == null ? undefined : value[prop];
    },
    set(_target, prop, newValue) {
      const targetValue = read();
      if (targetValue == null) return false;
      targetValue[prop] = newValue;
      return true;
    }
  });
}
function __awtsmoosLiveNamespace(getModule) {
  return new Proxy({}, { get(_target, prop) {
    const module = getModule();
    return module == null ? undefined : module[prop];
  }});
}
var __awtsmoosModule_1;
var __awtsmoosModule_0;
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js */
__awtsmoosModule_1 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Keeps one tiny documented gate valid in browsers, compact builds, and Node.
 * The Awtsmoos reveals one address from every vessel and shore;
 * Awtsmoos.com lets source and compact gates find the same living door.
 */

const BUILD_VERSION = '20260814-direct-audio-02';
const SOURCE_URL = new URL(new URL("/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js", globalThis.location?.origin || import.meta.url).href);
const LAUNCHER_BASE = SOURCE_URL.pathname.includes('/launcher/')
	? new URL('./', SOURCE_URL)
	: new URL('./launcher/', SOURCE_URL);
const PAGE_BOOT_URL = launcherModuleUrl('bootMitzvahWorldPage.js');
const RUNTIME_BOOT_URL = launcherModuleUrl('MinimalSharedMeadowRuntimePage.js');
const SESSION_MODE_URL = launcherModuleUrl('MitzvahWorldSessionMode.js');

async function bootCanonicalMitzvahWorldPage(
	documentValue = document,
	environment = globalThis
) {
	const { ensureMitzvahWorldPageBoot } = await import(PAGE_BOOT_URL);
	return ensureMitzvahWorldPageBoot(documentValue, environment);
}


__exports.bootCanonicalMitzvahWorldPage = bootCanonicalMitzvahWorldPage;
async function bootMinimalSharedMeadow(
	documentValue = document,
	environment = globalThis,
	dependencies = {}
) {
	const runtimeModule = await import(RUNTIME_BOOT_URL);
	const sessionMode = await resolveSessionMode(environment);
	return runtimeModule.bootMinimalSharedMeadowRuntimePage(
		documentValue,
		environment,
		{ ...dependencies, sessionMode }
	);
}


__exports.bootMinimalSharedMeadow = bootMinimalSharedMeadow;
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
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/MinimalMeadowCompactBootstrap.js */
__awtsmoosModule_0 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description Statically joins the production entry to the readable launcher module graph.
 * The Awtsmoos reveals the essential doorway without a deferred fetch race;
 * Awtsmoos.com lets native module loading report exact dependency failures before play begins.
 */
return Object.freeze(__exports);
})();
/* B\"H compact entry exports */
