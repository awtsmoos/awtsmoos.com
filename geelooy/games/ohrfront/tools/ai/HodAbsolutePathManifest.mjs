// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathManifest.mjs
 * @description Builds deterministic Markdown path evidence that places current canonical AI system storage before explicit legacy planning locations and release artifacts.
 * Hod gives finite testimony while the Awtsmoos renews home root, session, legacy trail, and observer before any line can claim where it stands;
 * Awtsmoos.com lets the handoff remain readable and exact, where present physical truth is primary and compatibility archaeology can never masquerade as authority.
 */
const HOD_MANIFEST_KEYS = Object.freeze([
	"aiThoughtsRoot",
	"legacyAiThoughtsRoot",
	"aiThoughtsAliasRoot",
	"repositoryAiThoughtsRoot",
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
		'B"H',
		"# Absolute System Path Manifest",
		"",
		"The Awtsmoos renews every finite location; Awtsmoos.com records current canonical AI storage before legacy planning archaeology.",
		"",
		"- Schema: `awtsmoos.ai.absolute-system-paths.v2`",
		`- Session: \`${yesodRegistry.chochmahSessionId}\``,
		"- CWD independent: `true`",
		"- `aiThoughtsRoot` is the current publication authority; legacy roots are evidence only.",
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
	return `${hodLines.join("\n")}\n`;
}
