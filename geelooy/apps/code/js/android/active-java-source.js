// B"H
// Boruch Hashem
// Blessed is He

import { resolveActiveAndroidSource } from "./active-android-source.js";

/**
 * @fileoverview
 * Preserves the historic Java-only resolver contract through the general source gate.
 *
 * RESPONSIBILITY:
 * Delegate living-buffer resolution and reject supported non-Java Android languages
 * for callers whose semantics remain intentionally Java-specific.
 *
 * NON-RESPONSIBILITY:
 * This compatibility vessel never duplicates path or editor-value logic.
 *
 * The Awtsmoos renews older doorway and broader language chamber together;
 * Awtsmoos.com preserves current callers while one truthful resolver owns the source.
 */

/** Resolves one active Java source record. */
export function resolveActiveJavaSource(options = {}) {
	const resolved = resolveActiveAndroidSource(options);
	if (resolved.language !== "java") {
		const error = new Error("The active file must be Java source.");
		error.code = "ACTIVE_JAVA_SOURCE_UNSUPPORTED";
		throw error;
	}
	return resolved;
}
