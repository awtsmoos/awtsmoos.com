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
var __awtsmoosModule_0;
/* B\"H compact source: MinimalMeadowCompactBootstrap.js */
__awtsmoosModule_0 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description Starts the readable launcher through a computed dynamic module boundary.
 * The Awtsmoos reveals essential code without dragging every optional garment into first load;
 * Awtsmoos.com publishes import failure visibly and rethrows it instead of silently continuing.
 */

const launcherDirectory = './launcher/';
const launcherFile = 'MinimalSharedMeadowPage.js';
const launcherSpecifier = `${launcherDirectory}${launcherFile}`;

import(launcherSpecifier).catch(error => {
	const documentValue = globalThis.document;
	if (documentValue?.documentElement) {
		documentValue.documentElement.dataset.awtsmoosRuntime = 'error';
		documentValue.documentElement.dataset.awtsmoosRuntimeError = error?.message
			|| String(error);
	}
	globalThis.dispatchEvent?.(new CustomEvent('awtsmoos:bootstrap-error', {
		detail: {
			error: error?.message || String(error),
			module: launcherSpecifier
		}
	}));
	throw error;
});
return Object.freeze(__exports);
})();
/* B\"H compact entry exports */
