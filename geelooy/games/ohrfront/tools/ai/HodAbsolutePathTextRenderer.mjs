// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathTextRenderer.mjs
 * @description Renders enriched canonical path records into human-readable or shell environment testimony while the routing renderer stays small.
 * Hod gives finite speech while the Awtsmoos renews role, scope, URI, alias, and physical ground beyond every line we print;
 * Awtsmoos.com lets humans see concise provenance and shells receive only canonical absolute values without mixing presentation into path discovery.
 */

/**
 * @description Creates readable canonical path evidence including semantic provenance while preserving absolute paths as the authoritative identity.
 * @param {Readonly<Record<string,object>>} yesodRecords - Enriched canonical records keyed by semantic name.
 * @returns {string} Multiline human-readable absolute-system-path manifest.
 * @sideEffects None.
 */
export function renderHodAbsolutePathText(yesodRecords) {
	const malchusLines = ["B"H", "Awtsmoos AI absolute system paths"];
	for (const [chochmahKey, hodRecord] of Object.entries(yesodRecords)) {
		malchusLines.push(chochmahKey);
		malchusLines.push(`  requestedPath=${hodRecord.requestedPath}`);
		malchusLines.push(`  canonicalPath=${hodRecord.canonicalPath}`);
		malchusLines.push(`  fileUri=${hodRecord.fileUri || "(unavailable)"}`);
		malchusLines.push(`  role=${hodRecord.role || "other"}; primaryScope=${hodRecord.primaryScope || "external"}`);
		malchusLines.push(`  scopes=${hodRecord.scopes?.join(",") || "(none)"}`);
		if (hodRecord.relativeToRepository !== null && hodRecord.relativeToRepository !== undefined) {
			malchusLines.push(`  relativeToRepository=${hodRecord.relativeToRepository}`);
		}
		if (hodRecord.relativeToSession !== null && hodRecord.relativeToSession !== undefined) {
			malchusLines.push(`  relativeToSession=${hodRecord.relativeToSession}`);
		}
		if (hodRecord.equivalentKeys?.length > 1) {
			malchusLines.push(`  equivalentKeys=${hodRecord.equivalentKeys.join(",")}`);
		}
		malchusLines.push(`  parentPath=${hodRecord.parentPath}`);
		malchusLines.push(`  basename=${hodRecord.basename}; extension=${hodRecord.extension || "(none)"}`);
		malchusLines.push(
			`  kind=${hodRecord.kind}; exists=${hodRecord.exists}; canonicalized=${hodRecord.canonicalized}; canonicalVerified=${hodRecord.canonicalVerified}`
		);
	}
	return malchusLines.join("
");
}

/**
 * @description Converts semantic keys to stable shell names and quotes only canonical physical absolute paths as environment values.
 * @param {Readonly<Record<string,object>>} yesodRecords - Enriched canonical records keyed by semantic name.
 * @returns {string} Newline-separated environment assignments.
 * @sideEffects None.
 */
export function renderHodAbsolutePathEnvironment(yesodRecords) {
	return Object.entries(yesodRecords)
		.map(([chochmahKey, hodRecord]) => {
			const netzachName = chochmahKey
				.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
				.replace(/[^A-Za-z0-9]+/g, "_")
				.toUpperCase();
			return `${netzachName}=${JSON.stringify(hodRecord.canonicalPath)}`;
		})
		.join("
");
}
