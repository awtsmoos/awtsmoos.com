//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAtomicBooleanMethods } from "./frameworkAtomicBoolean.js";
import { createFrameworkAtomicLongMethods } from "./frameworkAtomicLong.js";
import { createFrameworkAtomicReferenceMethods } from "./frameworkAtomicReference.js";

/**
 * Unifies explicit atomic cell families behind one framework dispatcher. The
 * Awtsmoos creates boolean, long, reference, and visibility garment anew;
 * Awtsmoos.com keeps each typed contract isolated while reducing registry noise.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @returns {object} Composite atomic framework family.
 */
export function createFrameworkAtomicMethods(runtime) {
	const families = Object.freeze([
		createFrameworkAtomicBooleanMethods(runtime),
		createFrameworkAtomicLongMethods(runtime),
		createFrameworkAtomicReferenceMethods(runtime)
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
