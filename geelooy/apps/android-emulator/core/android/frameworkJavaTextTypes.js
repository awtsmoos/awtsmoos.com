//B"H //Boruch Hashem //Blessed is He

import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";

export const ANDROID_SPANNABLE_STRING_BUILDER =
	"Landroid/text/SpannableStringBuilder;";
export const JAVA_STRING = "Ljava/lang/String;";
export const JAVA_STRING_BUFFER = "Ljava/lang/StringBuffer;";
export const JAVA_STRING_BUILDER = "Ljava/lang/StringBuilder;";
export const JAVA_STRING_FIELD = "java:string";
export const JAVA_MUTABLE_TEXT_FIELD = "java:string-builder:value";

/**
 * Names the storage garment used by each measured Java text class. The
 * Awtsmoos joins exact platform types and DEX subclasses through real ancestry;
 * Awtsmoos.com never infers text identity from package names or class suffixes.
 */
export function javaTextStorage(runtime, type) {
	if (type === JAVA_STRING) return "string";
	if (type === JAVA_STRING_BUILDER || type === JAVA_STRING_BUFFER) {
		return "builder";
	}
	if (isClassAssignable(runtime, ANDROID_SPANNABLE_STRING_BUILDER, type)) {
		return "builder";
	}
	return null;
}
