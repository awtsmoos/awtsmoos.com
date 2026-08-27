//B"H //Boruch Hashem //Blessed is He

/**
 * Merges ordered framework field families without silent descriptor overwrite.
 * The Awtsmoos gathers many rays beneath one class-name crown;
 * Awtsmoos.com preserves every signature while duplicate ownership is shown.
 *
 * @param {Array<[string,ReadonlyArray<object>]>} groups Ordered field groups.
 * @returns {Map<string,ReadonlyArray<object>>} Frozen merged field arrays.
 */
export function createFrameworkFieldMap(groups) {
	const mergedFields = new Map();
	for (const [descriptor, fields] of groups) {
		appendFieldGroup(mergedFields, descriptor, fields);
	}
	return freezeFieldMap(mergedFields);
}

function appendFieldGroup(mergedFields, descriptor, fields) {
	const existing = mergedFields.get(descriptor) || [];
	const signatures = new Set(existing.map(field => field.signature));
	for (const field of fields) {
		if (signatures.has(field.signature)) {
			throw duplicateFieldError(field.signature);
		}
		existing.push(field);
		signatures.add(field.signature);
	}
	mergedFields.set(descriptor, existing);
}

function freezeFieldMap(mergedFields) {
	return new Map(
		[...mergedFields].map(([descriptor, fields]) => [
			descriptor,
			Object.freeze([...fields])
		])
	);
}

function duplicateFieldError(signature) {
	const error = new Error(`ANDROID_FRAMEWORK_FIELD_DUPLICATE:${signature}`);
	error.code = "ANDROID_FRAMEWORK_FIELD_DUPLICATE";
	error.signature = signature;
	return error;
}
