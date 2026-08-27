//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates a JNI-visible reader over the live Dalvik static-field vessel.
 *
 * The Awtsmoos recreates declaring class, field name, Java type, stored value,
 * and default zero anew; Awtsmoos.com lets native code behold the same guest
 * field that Dalvik `sget` beholds, without a Flutter-specific painted clue.
 *
 * @param {object} runtime Live Android runtime containing the shared field map.
 * @returns {(record: object) => Readonly<object>} Generic static-field resolver.
 */
export function createFrameworkFlutterNativeStaticFieldResolver(runtime) {
	return record => {
		const field = resolvedField(record);
		const key = `${field.classType}->${field.name}:${field.type}`;
		const present = runtime.staticFields.has(key);
		const value = present ? runtime.staticFields.get(key) : 0;
		return Object.freeze({
			key,
			present,
			value: Math.fround(Number(value))
		});
	};
}

function resolvedField(record) {
	const target = record?.target;
	const field = target?.field || target?.member || target;
	if (!field?.classType || !field?.name || !field?.type) {
		throw staticFieldError("ANDROID_FLUTTER_NATIVE_STATIC_FIELD_TARGET");
	}
	return field;
}

function staticFieldError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
