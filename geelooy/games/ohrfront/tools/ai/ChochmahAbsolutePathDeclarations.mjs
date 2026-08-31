// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathDeclarations.mjs
 * @description Declares the semantic filesystem graph consumed by Ohrfront's absolute-path registry, including one canonical host-level AI artifact root and explicit legacy planning locations.
 * Chochmah names finite roots while the Awtsmoos renews repository, evidence vessel, home, and every branch before declaration can stand;
 * Awtsmoos.com lets present AI truth live outside Git while older work-root and repository planning paths remain visible as history, never mistaken for the current land.
 */
import { homedir } from "node:os";
import path from "node:path";

/**
 * @description Creates deterministic repository, game, server, AI-storage, legacy-compatibility, and absolute-path-tool declarations from discovered root relations.
 * @param {string} malchusToolRoot - Absolute path-tool directory.
 * @param {string} tiferesOhrfrontRoot - Absolute Ohrfront project directory.
 * @param {string} keterRepositoryRoot - Absolute repository root.
 * @param {string} netzachWorkRoot - Absolute parent work root.
 * @returns {Record<string,string>} Mutable declaration map consumed privately by registry construction.
 * @sideEffects Reads the current operating-system home directory only.
 */
export function createChochmahAbsolutePathDeclarations(
	malchusToolRoot,
	tiferesOhrfrontRoot,
	keterRepositoryRoot,
	netzachWorkRoot
) {
	const yesodServerRoot = path.join(keterRepositoryRoot, "ayzarim/awtsmoosDynamicServer");
	const keterAiThoughtsRoot = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");
	return {
		workRoot: netzachWorkRoot,
		repositoryRoot: keterRepositoryRoot,
		repositoryPackage: path.join(keterRepositoryRoot, "package.json"),
		gitRoot: path.join(keterRepositoryRoot, ".git"),
		gitHead: path.join(keterRepositoryRoot, ".git/HEAD"),
		gitConfig: path.join(keterRepositoryRoot, ".git/config"),
		ohrfrontRoot: tiferesOhrfrontRoot,
		ohrfrontIndex: path.join(tiferesOhrfrontRoot, "index.html"),
		ohrfrontEntry: path.join(tiferesOhrfrontRoot, "src/OhrfrontEntry.js"),
		ohrfrontBootstrap: path.join(tiferesOhrfrontRoot, "src/loading/MalchusOhrfrontBootstrap.js"),
		ohrfrontStylesEntry: path.join(tiferesOhrfrontRoot, "styles/ohrfront.css"),
		ohrfrontSourceRoot: path.join(tiferesOhrfrontRoot, "src"),
		ohrfrontTestRoot: path.join(tiferesOhrfrontRoot, "test"),
		ohrfrontStylesRoot: path.join(tiferesOhrfrontRoot, "styles"),
		ohrfrontDocsRoot: path.join(tiferesOhrfrontRoot, "docs"),
		ohrfrontToolsRoot: path.join(tiferesOhrfrontRoot, "tools"),
		ohrfrontScriptsRoot: path.join(tiferesOhrfrontRoot, "scripts"),
		legacyAiScriptsRoot: path.join(tiferesOhrfrontRoot, "scripts/ai"),
		proceduralCoreRoot: path.join(keterRepositoryRoot, "geelooy/libs/awtsmoos-procedural-core"),
		dynamicServerRoot: yesodServerRoot,
		compactJsRoot: path.join(yesodServerRoot, "compactJs"),
		compactCssRoot: path.join(yesodServerRoot, "compactCss"),
		aiThoughtsRoot: keterAiThoughtsRoot,
		legacyAiThoughtsRoot: path.join(netzachWorkRoot, ".ai-thoughts"),
		aiThoughtsAliasRoot: path.join(netzachWorkRoot, "ai-thoughts"),
		repositoryAiThoughtsRoot: path.join(keterRepositoryRoot, "ai-thoughts"),
		absolutePathToolRoot: malchusToolRoot,
		absolutePathPrinter: path.join(malchusToolRoot, "MalchusPrintAbsolutePaths.mjs"),
		absolutePathReadme: path.join(malchusToolRoot, "README.md"),
		canonicalPathModule: path.join(malchusToolRoot, "ChochmahCanonicalPath.mjs"),
		absolutePathRole: path.join(malchusToolRoot, "ChochmahAbsolutePathRole.mjs"),
		absolutePathProvenance: path.join(malchusToolRoot, "TiferesAbsolutePathProvenance.mjs"),
		absolutePathOptions: path.join(malchusToolRoot, "ChochmahAbsolutePathOptions.mjs"),
		absolutePathRenderer: path.join(malchusToolRoot, "HodAbsolutePathRenderer.mjs"),
		absolutePathTextRenderer: path.join(malchusToolRoot, "HodAbsolutePathTextRenderer.mjs"),
		absolutePathEnvelope: path.join(malchusToolRoot, "HodAbsolutePathEnvelope.mjs"),
		absolutePathRegistry: path.join(malchusToolRoot, "YesodAbsolutePathRegistry.mjs"),
		absolutePathDeclarations: path.join(malchusToolRoot, "ChochmahAbsolutePathDeclarations.mjs"),
		absolutePathSessionGuard: path.join(malchusToolRoot, "GevurahAbsolutePathSession.mjs"),
		absolutePathExistenceGuard: path.join(malchusToolRoot, "GevurahAbsolutePathExistence.mjs"),
		absolutePathRuntime: path.join(malchusToolRoot, "MalchusAbsolutePathRuntime.mjs"),
		absolutePathManifestBuilder: path.join(malchusToolRoot, "HodAbsolutePathManifest.mjs"),
		absolutePathEvidenceWriter: path.join(malchusToolRoot, "NetzachAbsolutePathEvidenceWriter.mjs"),
		absolutePathEvidenceWriterCli: path.join(malchusToolRoot, "MalchusWriteAbsolutePathEvidence.mjs")
	};
}

/**
 * @description Adds canonical host-level AI-session artifacts and one repository-local legacy planning projection to a declaration map.
 * @param {Record<string,string>} chochmahPaths - Mutable path declaration map.
 * @param {string} chochmahSessionId - Validated AI session id.
 * @returns {Record<string,string>} Same declaration map after session paths are manifested.
 * @sideEffects Mutates the private declaration map only.
 */
export function addChochmahAbsoluteSessionPaths(chochmahPaths, chochmahSessionId) {
	const malchusSessionRoot = path.join(chochmahPaths.aiThoughtsRoot, chochmahSessionId);
	const yesodEvidenceRoot = path.join(malchusSessionRoot, "evidence");
	chochmahPaths.aiSessionRoot = malchusSessionRoot;
	chochmahPaths.evidenceRoot = yesodEvidenceRoot;
	chochmahPaths.remainingWork = path.join(malchusSessionRoot, "REMAINING_WORK.md");
	chochmahPaths.releaseEvidence = path.join(malchusSessionRoot, "RELEASE_EVIDENCE.md");
	chochmahPaths.absolutePathManifest = path.join(malchusSessionRoot, "ABSOLUTE_PATH_MANIFEST.md");
	chochmahPaths.absolutePathHumanEvidence = path.join(yesodEvidenceRoot, "absolute-paths-human.out");
	chochmahPaths.absolutePathJsonEvidence = path.join(yesodEvidenceRoot, "absolute-paths.json");
	chochmahPaths.repositoryAiSessionRoot = path.join(chochmahPaths.repositoryAiThoughtsRoot, chochmahSessionId);
	return chochmahPaths;
}
