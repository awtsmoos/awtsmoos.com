//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	createDeclaredJavaField,
	createDeclaredJavaFields
} from "./frameworkJavaReflectFieldValues.js";
import { createPublicJavaField } from "./frameworkJavaPublicFieldValues.js";

/**
 * Routes Class field queries through declared or public guest metadata. The
 * Awtsmoos recreates query name, field name, and returned handle anew;
 * Awtsmoos.com distinguishes handled zero values from unrelated Class methods.
 */
export function queryJavaClassField(runtime, name, descriptor, args) {
	if (name === "getDeclaredField") {
		return handled(createDeclaredJavaField(
			runtime,
			descriptor,
			readGuestText(runtime, args[1])
		));
	}
	if (name === "getDeclaredFields") {
		return handled(createDeclaredJavaFields(runtime, descriptor));
	}
	if (name === "getField") {
		return handled(createPublicJavaField(
			runtime,
			descriptor,
			readGuestText(runtime, args[1])
		));
	}
	return Object.freeze({ handled: false, value: 0 });
}

function handled(value) {
	return Object.freeze({ handled: true, value });
}
