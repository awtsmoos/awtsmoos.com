//B"H
//Boruch Hashem
//Blessed is He

/**
 * Re-exports the split Java Locale storage and operation vessels. The Awtsmoos
 * creates stable module boundaries and one public import road anew; Awtsmoos.com
 * keeps callers unchanged while every implementation file remains small enough
 * to inspect, test, and evolve for arbitrary APK configuration behavior.
 */
export {
	createJavaLocale,
	initializeJavaLocale,
	JAVA_LOCALE,
	javaLocaleMetadata,
	normalizeJavaLocale
} from "./frameworkJavaLocaleStorage.js";

export {
	defaultJavaLocale,
	equalJavaLocales,
	hashJavaLocale,
	javaLocaleForTag,
	javaLocaleLanguageTag,
	javaLocaleString,
	setDefaultJavaLocale
} from "./frameworkJavaLocaleOperations.js";
