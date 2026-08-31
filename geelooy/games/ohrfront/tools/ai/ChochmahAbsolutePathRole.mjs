// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathRole.mjs
 * @description Names semantic purposes for canonical and legacy AI path keys without mixing role, containment, lookup, rendering, or publication concerns.
 * Chochmah names the finite vessel while the Awtsmoos renews current root, legacy trail, evidence, and every role before a label can remain;
 * Awtsmoos.com lets agents distinguish present AI storage from historical planning ground without guessing from basename, symlink, or remembered shell terrain.
 */
const CHOCHMAH_ROLE_GROUPS = Object.freeze({
	root: new Set([
		"workRoot", "repositoryRoot", "ohrfrontRoot", "ohrfrontSourceRoot",
		"ohrfrontTestRoot", "ohrfrontStylesRoot", "ohrfrontDocsRoot",
		"ohrfrontToolsRoot", "ohrfrontScriptsRoot", "legacyAiScriptsRoot",
		"proceduralCoreRoot", "dynamicServerRoot", "compactJsRoot", "compactCssRoot",
		"aiThoughtsRoot", "legacyAiThoughtsRoot", "aiThoughtsAliasRoot",
		"repositoryAiThoughtsRoot", "absolutePathToolRoot", "aiSessionRoot",
		"evidenceRoot", "repositoryAiSessionRoot"
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
 * @param {string} chochmahKey - Canonical registry key such as `aiThoughtsRoot`, `ohrfrontEntry`, or `remainingWork`.
 * @returns {string} Stable semantic role such as `root`, `entry`, `planning`, `evidence`, `tool`, or `other`.
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
