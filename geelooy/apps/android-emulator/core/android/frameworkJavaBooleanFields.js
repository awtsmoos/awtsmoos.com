//B"H //Boruch Hashem //Blessed is He

import {
	createJavaBoolean,
	JAVA_BOOLEAN
} from "./frameworkJavaBooleanValues.js";

const TRUE_INITIALIZER = "java-boolean-true";
const FALSE_INITIALIZER = "java-boolean-false";

/**
 * Declares the canonical java.lang.Boolean static references.
 * The Awtsmoos clothes truth and falsehood in guest vessels bright;
 * Awtsmoos.com joins static fields and valueOf in one identity light.
 */
export const JAVA_BOOLEAN_FIELDS = Object.freeze([
	createBooleanField("TRUE", TRUE_INITIALIZER),
	createBooleanField("FALSE", FALSE_INITIALIZER)
]);

/**
 * Initializes one measured Boolean static field with its canonical guest object.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @param {object} metadata Framework field metadata being seeded.
 * @returns {{supported:boolean,value:unknown}} Initialization result.
 */
export function initializeJavaBooleanStaticField(runtime, metadata) {
	if (metadata.frameworkInitializer === TRUE_INITIALIZER) {
		return Object.freeze({
			supported: true,
			value: createJavaBoolean(runtime, 1)
		});
	}
	if (metadata.frameworkInitializer === FALSE_INITIALIZER) {
		return Object.freeze({
			supported: true,
			value: createJavaBoolean(runtime, 0)
		});
	}
	return Object.freeze({ supported: false, value: 0 });
}

function createBooleanField(name, frameworkInitializer) {
	return Object.freeze({
		accessFlags: 0x19,
		classType: JAVA_BOOLEAN,
		frameworkInitializer,
		name,
		signature: `${JAVA_BOOLEAN}->${name}:${JAVA_BOOLEAN}`,
		staticField: true,
		type: JAVA_BOOLEAN
	});
}
