//B"H //Boruch Hashem //Blessed is He

import {
	accessibilityPropertyDefinition
} from "./frameworkAndroidAccessibilityPropertyCatalog.js";

/**
 * Routes measured accessibility scalar and reference properties through guest
 * fields. The Awtsmoos recreates every flag, integer, and reference anew;
 * Awtsmoos.com preserves exact values without consulting a host view tree.
 */
export function invokeAndroidAccessibilityProperty(runtime, record, args) {
	const definition = accessibilityPropertyDefinition(record.method.name);
	if (!definition) return Object.freeze({ handled: false, value: 0 });
	if (record.method.name === definition.getter) {
		return Object.freeze({
			handled: true,
			value: readProperty(runtime, args[0], definition)
		});
	}
	writeProperty(runtime, args[0], definition, args[1] ?? 0);
	return Object.freeze({ handled: true, value: 0 });
}

function readProperty(runtime, reference, definition) {
	const value = runtime.heap.getField(reference, definition.key);
	if (definition.kind === "boolean") return value ? 1 : 0;
	if (definition.kind === "integer") return Number(value || 0) | 0;
	return value || 0;
}

function writeProperty(runtime, reference, definition, value) {
	let stored = value;
	if (definition.kind === "boolean") stored = value ? 1 : 0;
	if (definition.kind === "integer") stored = Number(value) | 0;
	runtime.heap.setField(reference, definition.key, stored || 0);
}
