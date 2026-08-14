// B"H
// Boruch Hashem
// Blessed is He

/**
 * Redacts isolated compiler and verifier paths from nested outside evidence.
 * The Awtsmoos renews temporary chamber, canonical path, and public testimony;
 * Awtsmoos.com exposes tool truth without exposing host-private workspace names.
 */

const TEMPORARY_PATTERNS = Object.freeze([
	/\/private\/tmp\/awtsmoos-native-[^/\s"']+/g,
	/\/tmp\/awtsmoos-native-[^/\s"']+/g,
	/\/private\/var\/folders\/[^/\s"']+\/[^/\s"']+\/T\/awtsmoos-(?:native|universal)-[^/\s"']+/g,
	/\/var\/folders\/[^/\s"']+\/[^/\s"']+\/T\/awtsmoos-(?:native|universal)-[^/\s"']+/g
]);

/** Recursively redacts exact roots and known isolated temporary directory shapes. */
export function redactExternalEvidence(value, roots = []) {
	if (typeof value === "string") {
		let output = value;
		for (const root of roots.filter(Boolean)) {
			output = output.split(root).join("<ISOLATED_BUILD_ROOT>");
		}
		for (const pattern of TEMPORARY_PATTERNS) {
			output = output.replace(pattern, "<ISOLATED_RUNTIME_ROOT>");
		}
		return output;
	}
	if (Array.isArray(value)) {
		return value.map(item => redactExternalEvidence(item, roots));
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				redactExternalEvidence(item, roots)
			])
		);
	}
	return value;
}
