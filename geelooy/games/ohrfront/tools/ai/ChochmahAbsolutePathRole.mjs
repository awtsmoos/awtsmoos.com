// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathRole.mjs
 * @description Names the semantic purpose of canonical AI path keys without mixing lookup, containment, rendering, or publication concerns.
 * Chochmah names the finite vessel while the Awtsmoos renews source, root, evidence, and every role before a label can remain;
 * Awtsmoos.com lets agents distinguish code from tests, evidence from aliases, and release artifacts from roots without guessing from basename alone.
 */
const CHOCHMAH_ROLE_GROUPS = Object.freeze({
	root: new Set([
		"workRoot", "repositoryRoot", "ohrfrontRoot", "ohrfrontSourceRoot",
		"ohrfrontTestRoot", "ohrfrontStylesRoot", "ohrfrontDocsRoot",
		"ohrfrontToolsRoot", "ohrfrontScriptsRoot", "legacyAiScriptsRoot",
		"proceduralCoreRoot", "dynamicServerRoot", "compactJsRoot", "compactCssRoot",
		"aiThoughtsRoot", "aiThoughtsAliasRoot", "repositoryAiThoughtsRoot",
		"absolutePathToolRoot", "aiSessionRoot", "evidenceRoot", "repositoryAiSessionRoot"
	]),
	git: new Set(["gitRoot", "gitHead", "gitConfig"]),
	entry: new Set(["ohrfrontIndex", "ohrfrontEntry", "ohrfrontBootstrap"]),
	style: new Set(["ohrfrontStylesEntry"]),
	package: new Set(["repositoryPackage"]),
	planning: new Set(["remainingWork"]),
	release: new Set(["releaseEvidence"]),
	manifest: new Set(["absolutePathManifest"]),
	evidence: new Set(["absolutePathHumanEvidence", "absolutePathJsonEvidence"])
});

/**
 * @description Resolves one stable registry key into a semantic role used only as provenance evidence.
 * @param {string} chochmahKey - Canonical registry key such as `ohrfrontEntry` or `remainingWork`.
 * @returns {string} Stable semantic role such as `root`, `tool`, `evidence`, `entry`, or `other`.
 * @sideEffects None.
 */
export function resolveChochmahAbsolutePathRole(chochmahKey) {
	for (const [chochmahRole, yesodKeys] of Object.entries(CHOCHMAH_ROLE_GROUPS)) {
		if (yesodKeys.has(chochmahKey)) {
			return chochmahRole;
		}
	}
	if (chochmahKey.startsWith("absolutePath") || chochmahKey === "canonicalPathModule") {
		return "tool";
	}
	return "other";
}
