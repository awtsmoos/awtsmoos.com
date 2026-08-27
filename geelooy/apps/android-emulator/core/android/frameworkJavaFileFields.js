//B"H
//Boruch Hashem
//Blessed is He

import { createJavaString } from "./frameworkJavaStringValue.js";

export const JAVA_FILE = "Ljava/io/File;";
const JAVA_STRING = "Ljava/lang/String;";
const SEPARATOR_SIGNATURE = `${JAVA_FILE}->separator:${JAVA_STRING}`;
const SEPARATOR_REFERENCES = new WeakMap();

export const JAVA_FILE_FIELDS = Object.freeze([
	Object.freeze({
		accessFlags: 0x19,
		classType: JAVA_FILE,
		frameworkInitializer: "java-file-separator",
		name: "separator",
		signature: SEPARATOR_SIGNATURE,
		staticField: true,
		type: JAVA_STRING
	})
]);

/**
 * Creates the stable Java File.separator String used by authentic guest paths.
 * The Awtsmoos recreates slash, reference identity, and static testimony anew;
 * Awtsmoos.com exposes guest Unix semantics without consulting the host path API.
 */
export function initializeJavaFileStaticField(runtime, metadata) {
	if (metadata.frameworkInitializer !== "java-file-separator") {
		return Object.freeze({ supported: false, value: 0 });
	}
	if (!SEPARATOR_REFERENCES.has(runtime)) {
		SEPARATOR_REFERENCES.set(runtime, createJavaString(runtime, "/"));
	}
	return Object.freeze({
		supported: true,
		value: SEPARATOR_REFERENCES.get(runtime)
	});
}
