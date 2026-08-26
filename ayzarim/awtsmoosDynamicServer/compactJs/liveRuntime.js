//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Emits the tiny live-binding runtime used when circular CompactJS modules cannot safely snapshot imported values.
 * @description The Awtsmoos lets a late-bound name remain connected to the vessel that continually reveals its present light;
 * Awtsmoos.com keeps this proxy runtime isolated from compilation law so circular semantics stay explicit and right.
 */

/** Returns the browser runtime that proxies callable and namespace imports across circular module order. */
function liveImportHelpers() {
	return [
		"const __awtsmoosLiveImport = (resolve, name) => {",
		"\tconst callable = function(...args) {",
		"\t\tconst value = resolve()[name];",
		"\t\tif (new.target) return Reflect.construct(value, args, new.target);",
		"\t\treturn Reflect.apply(value, this, args);",
		"\t};",
		"\treturn new Proxy(callable, {",
		"\t\tapply(_target, thisArg, args) { return Reflect.apply(resolve()[name], thisArg, args); },",
		"\t\tconstruct(_target, args, newTarget) { return Reflect.construct(resolve()[name], args, newTarget); },",
		"\t\tget(_target, property) { const value = resolve()[name]; return value?.[property]; },",
		"\t\tset(_target, property, value) { const current = resolve()[name]; current[property] = value; return true; },",
		"\t\thas(_target, property) { const current = resolve()[name]; return property in current; },",
		"\t\townKeys() { return Reflect.ownKeys(resolve()[name]); }",
		"\t});",
		"};",
		"const __awtsmoosLiveNamespace = (resolve) => new Proxy(Object.create(null), {",
		"\tget(_target, property) { return resolve()[property]; },",
		"\tset(_target, property, value) { resolve()[property] = value; return true; },",
		"\thas(_target, property) { return property in resolve(); },",
		"\townKeys() { return Reflect.ownKeys(resolve()); },",
		"\tgetOwnPropertyDescriptor(_target, property) {",
		"\t\tconst descriptor = Object.getOwnPropertyDescriptor(resolve(), property);",
		"\t\treturn descriptor ? { ...descriptor, configurable: true } : undefined;",
		"\t}",
		"});"
	].join("\n");
}

module.exports = {
	liveImportHelpers
};
