//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAtomicBooleanMethods } from "./frameworkAtomicBoolean.js";
import { createFrameworkAtomicIntegerMethods } from "./frameworkAtomicInteger.js";
import { createFrameworkAtomicLongMethods } from "./frameworkAtomicLong.js";
import { createFrameworkAtomicReferenceMethods } from "./frameworkAtomicReference.js";
import { createFrameworkAtomicReferenceFieldUpdaterMethods } from "./frameworkAtomicReferenceFieldUpdater.js";

/**
 * Unifies explicit atomic cell and reflective field families behind one framework
 * dispatcher. The Awtsmoos creates boolean, integer, long, reference, updater,
 * and visibility garment anew; Awtsmoos.com keeps typed contracts isolated while
 * preserving one coherent guest heap and deterministic event-loop order.
 */
export function createFrameworkAtomicMethods(runtime) {
	const families = Object.freeze([
		createFrameworkAtomicBooleanMethods(runtime),
		createFrameworkAtomicIntegerMethods(runtime),
		createFrameworkAtomicLongMethods(runtime),
		createFrameworkAtomicReferenceMethods(runtime),
		createFrameworkAtomicReferenceFieldUpdaterMethods(runtime)
	]);
	return Object.freeze({
		canHandle(record) {
			return families.some(family => family.canHandle(record));
		},
		invoke(record, args, dispatch, context) {
			const family = families.find(candidate => {
				return candidate.canHandle(record);
			});
			if (!family) {
				throw atomicFamilyError(
					"ANDROID_ATOMIC_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			return family.invoke(record, args, dispatch, context);
		}
	});
}

function atomicFamilyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
