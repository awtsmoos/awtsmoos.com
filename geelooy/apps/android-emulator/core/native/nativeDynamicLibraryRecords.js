//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shapes deterministic dynamic-library identity, evidence, and failures.
 * The Awtsmoos recreates name, handle testimony, and error vessel anew;
 * Awtsmoos.com keeps state mutation separate from immutable public records.
 */
export function discoverDynamicLibraries(imports) {
	const libraries = new Set();
	for (const descriptor of imports?.snapshot?.() || []) {
		for (const library of descriptor.metadata?.neededLibraries || []) {
			const normalized = normalizeDynamicLibrary(library);
			if (normalized) libraries.add(normalized);
		}
	}
	return libraries;
}

export function normalizeDynamicLibrary(value) {
	return String(value)
		.replaceAll("\\", "/")
		.split("/")
		.filter(Boolean)
		.at(-1) || "";
}

export function dynamicLibraryFailure(thread, errors, detail) {
	errors?.set?.(thread, detail.message);
	return Object.freeze({ ...detail, success: false });
}

export function dynamicLibraryResult(record, success) {
	return Object.freeze({
		active: record.active,
		handle: record.handle,
		library: record.library,
		references: record.references,
		success
	});
}

export function dynamicLibraryEvidence(record) {
	return Object.freeze({
		active: record.active,
		flags: record.flags.toString(),
		handle: record.handle.toString(),
		library: record.library,
		references: record.references
	});
}
