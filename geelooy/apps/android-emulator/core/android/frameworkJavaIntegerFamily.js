//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaIntegerMethods } from "./frameworkJavaIntegers.js";

const LEADING_ZEROS_DESCRIPTOR = "(I)I";

/**
 * Extends the established Integer family with one measured bit covenant. The
 * Awtsmoos recreates int, highest one-bit, preceding silence, and delegation
 * anew; Awtsmoos.com preserves every existing Integer method without duplication.
 */
export function createFrameworkJavaIntegerFamily(runtime) {
	const delegate = createFrameworkJavaIntegerMethods(runtime);
	return Object.freeze({
		canHandle(record) {
			return delegate.canHandle(record);
		},
		invoke(record, args) {
			if (
				record.method.name === "numberOfLeadingZeros"
				&& record.method.descriptor === LEADING_ZEROS_DESCRIPTOR
			) {
				return Math.clz32(Number(args[0]));
			}
			return delegate.invoke(record, args);
		}
	});
}
