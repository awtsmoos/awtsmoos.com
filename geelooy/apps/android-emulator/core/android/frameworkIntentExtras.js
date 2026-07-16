//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	bundleValues,
	copyBundle,
	getBundleValue,
	putBundleValue,
	removeBundleValue
} from "./frameworkBundleStorage.js";
import { ensureIntentExtras, intentState } from "./frameworkIntentStorage.js";

/**
 * Implements typed Intent extras through the same bounded Bundle vessel. The
 * Awtsmoos creates key, fallback, insertion, copy, and removal anew; Awtsmoos.com
 * preserves guest references without reading serialized or authenticated payloads.
 */
export function invokeIntentExtra(runtime, record, args) {
	const name = record.method.name;
	if (name === "putExtras") {
		copyBundle(runtime, ensureIntentExtras(runtime, args[0]), args[1]);
		return args[0];
	}
	if (name === "putParcelableArrayListExtra" || name === "putExtra") {
		putBundleValue(runtime, ensureIntentExtras(runtime, args[0]), key(runtime, args[1]), args[2] ?? 0);
		return args[0];
	}
	if (name === "removeExtra") {
		const extras = intentState(runtime, args[0]).extras;
		if (extras?.id) removeBundleValue(runtime, extras, key(runtime, args[1]));
		return undefined;
	}
	if (name === "hasExtra") {
		const extras = intentState(runtime, args[0]).extras;
		return extras?.id && bundleValues(runtime, extras).has(key(runtime, args[1])) ? 1 : 0;
	}
	if (name === "getExtras") return intentState(runtime, args[0]).extras || 0;
	return readIntentExtra(runtime, record, args);
}

export function isIntentExtraMethod(name) {
	return name === "getExtras"
		|| name === "hasExtra"
		|| name === "putExtra"
		|| name === "putExtras"
		|| name === "putParcelableArrayListExtra"
		|| name === "removeExtra"
		|| /^(?:get.+Extra)$/.test(name);
}

function readIntentExtra(runtime, record, args) {
	const extras = intentState(runtime, args[0]).extras;
	const fallback = extraFallback(record, args);
	if (!extras?.id) return fallback;
	return getBundleValue(runtime, extras, key(runtime, args[1]), fallback);
}

function extraFallback(record, args) {
	if (["getBooleanExtra", "getIntExtra"].includes(record.method.name)) return args[2] ?? 0;
	return 0;
}

function key(runtime, value) {
	return readGuestText(runtime, value);
}
