// B"H
const vm = require("vm");

/** Creates one Node VM sky with browser globals available by their ordinary names. */
function createVmContext(globals) {
	const bag = { ...globals };
	bag.globalThis = bag;
	bag.window = globals.window;
	bag.self = globals.window;
	bag.document = globals.document;
	bag.console = globals.console;
	installCoreConstructors(bag, globals);
	installPlatformGlobals(bag, globals.window);
	installWindowMethods(bag, globals.window);
	return vm.createContext(bag);
}

function installCoreConstructors(bag, globals) {
	Object.assign(bag, {
		Promise, Array, Object, JSON, Math, Date, RegExp, Error, TypeError, URL
	});
	for (const name of [
		"setTimeout", "clearTimeout", "setInterval", "clearInterval", "fetch",
		"requestAnimationFrame", "cancelAnimationFrame"
	]) {
		if (globals[name]) bag[name] = globals[name];
	}
}

function installPlatformGlobals(bag, windowObject) {
	const canvas = windowObject?.document?.createElement?.("canvas");
	Object.assign(bag, {
		performance: windowObject?.performance,
		structuredClone: windowObject?.structuredClone,
		queueMicrotask: windowObject?.queueMicrotask,
		crypto: windowObject?.crypto,
		HTMLCanvasElement: canvas?.constructor,
		OffscreenCanvas: windowObject?.OffscreenCanvas,
		ImageData: windowObject?.ImageData,
		ImageBitmap: windowObject?.ImageBitmap
	});
}

function installWindowMethods(bag, windowObject) {
	for (const name of [
		"addEventListener", "removeEventListener", "dispatchEvent", "alert",
		"confirm", "prompt", "open", "close", "scrollTo", "scrollBy", "matchMedia"
	]) {
		if (typeof windowObject?.[name] === "function") {
			bag[name] = windowObject[name].bind(windowObject);
		}
	}
}

function installNamedElements(context) {
	installWindowMethods(context, context.window);
	const all = context.document?.querySelectorAll?.("[id]") || [];
	for (const element of all) {
		if (element.id && !(element.id in context)) context[element.id] = element;
		if (element.id && context.window && !(element.id in context.window)) {
			context.window[element.id] = element;
		}
	}
}

module.exports = {
	createVmContext,
	installNamedElements,
	installPlatformGlobals,
	installWindowMethods
};
