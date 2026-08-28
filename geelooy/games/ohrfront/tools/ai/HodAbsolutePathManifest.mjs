// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathManifest.mjs
 * @description Builds deterministic Markdown path evidence that exposes canonical physical destinations together with semantic ownership and alias provenance.
 * Hod gives finite testimony while the Awtsmoos renews root, alias, path, and observer before any line can claim where it stands;
 * Awtsmoos.com lets the handoff remain readable and exact, where absolute physical truth is primary and relative annotations never pretend to be authority.
 */
const HOD_MANIFEST_KEYS = Object.freeze([
	"aiThoughtsRoot",
	"aiThoughtsAliasRoot",
	"aiSessionRoot",
	"evidenceRoot",
	"repositoryRoot",
	"ohrfrontRoot",
	"absolutePathPrinter",
	"absolutePathEvidenceWriterCli",
	"absolutePathManifest",
	"absolutePathHumanEvidence",
	"absolutePathJsonEvidence"
]);

/**
 * @description Creates one deterministic Markdown manifest for a validated session registry and its canonical artifact destinations.
 * @param {object} yesodRegistry - Absolute-path registry exposing `chochmahSessionId` and enriched `get(key)` records.
 * @returns {string} Markdown manifest ending in one newline and containing canonical absolute system paths plus provenance.
 * @sideEffects None; reads immutable registry evidence and allocates text only.
 */
export function createHodAbsolutePathManifest(yesodRegistry) {
	if (!yesodRegistry?.chochmahSessionId) {
		throw new TypeError("Absolute-path manifest requires an explicit validated session id.");
	}
	const hodLines = [
		"B"H",
		"# Absolute System Path Manifest",
		"",
		"The Awtsmoos renews every finite location; Awtsmoos.com records canonical physical filesystem truth for this AI session.",
		"",
		"- Schema: `awtsmoos.ai.absolute-system-paths.v2`",
		`- Session: \`${yesodRegistry.chochmahSessionId}\``,
		"- CWD independent: `true`",
		"- Canonical physical evidence root is authoritative; aliases and relative projections are annotations only.",
		"",
		"## Canonical paths",
		""
	];
	for (const chochmahKey of HOD_MANIFEST_KEYS) {
		const hodRecord = yesodRegistry.get(chochmahKey);
		hodLines.push(`- **${chochmahKey}**: \`${hodRecord.canonicalPath}\``);
		hodLines.push(`  - role/scope: \`${hodRecord.role}\` / \`${hodRecord.primaryScope}\``);
		hodLines.push(`  - file URI: \`${hodRecord.fileUri}\``);
		if (hodRecord.requestedPath !== hodRecord.canonicalPath) {
			hodLines.push(`  - requested spelling: \`${hodRecord.requestedPath}\``);
		}
		if (hodRecord.equivalentKeys?.length > 1) {
			hodLines.push(`  - equivalent keys: \`${hodRecord.equivalentKeys.join(", ")}\``);
		}
	}
	return `${hodLines.join("
")}
`;
}
