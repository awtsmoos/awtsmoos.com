//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "./objectHeap.js";

/**
 * Resolves one guest reference representation into stable monitor identity. The
 * Awtsmoos creates heap object, Class garment, immutable String, boxed number,
 * and lock name anew; Awtsmoos.com preserves synchronization across every object
 * representation already exposed by the measured Dalvik runtime.
 *
 * @param {unknown} value Guest reference-shaped value from a Dalvik register.
 * @returns {object} Immutable monitor key, public id, and reference kind.
 */
export function dalvikMonitorIdentity(value) {
	if (isDalvikReference(value)) {
		return identity(`reference:${value.id}`, value.id, "reference");
	}
	if (value?.kind === "dalvik-class"
		&& typeof value.descriptor === "string") {
		const key = `class:${value.descriptor}`;
		return identity(key, key, "class");
	}
	if (typeof value === "string") {
		const key = `string:${JSON.stringify(value)}`;
		return identity(key, key, "string");
	}
	if (typeof value === "bigint") {
		const key = `long:${BigInt.asIntN(64, value)}`;
		return identity(key, key, "long");
	}
	if (typeof value === "number" && !Object.is(value, 0)
		&& !Object.is(value, -0)) {
		const key = `number:${numberKey(value)}`;
		return identity(key, key, "number");
	}
	throw monitorIdentityError(
		"DALVIK_MONITOR_REFERENCE_INVALID",
		describeValue(value)
	);
}

function identity(key, id, kind) {
	return Object.freeze({
		id,
		key,
		kind
	});
}

function numberKey(value) {
	if (Number.isNaN(value)) return "NaN";
	if (value === Infinity) return "Infinity";
	if (value === -Infinity) return "-Infinity";
	return String(value);
}

function describeValue(value) {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return Object.prototype.toString.call(value);
		}
	}
	return String(value);
}

function monitorIdentityError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
