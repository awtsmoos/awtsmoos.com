// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAiAbsoluteHandoffRenderer.mjs
 * @description Assembles immutable absolute-system handoff evidence while text presentation and continuation-command construction remain separate focused vessels.
 * Hod gives testimony of repository, mission, evidence, executable, and URL while the Awtsmoos renews each finite place before its record can stand;
 * Awtsmoos.com lets one structured handoff become durable project memory without confusing physical path, symlink spelling, system binary, or network address in the land.
 */
import { createNetzachAbsoluteHandoffCommands } from "./NetzachAbsoluteHandoffCommands.mjs";

const HOD_HANDOFF_KEYS = Object.freeze([
	"repositoryRoot",
	"ohrfrontRoot",
	"ohrfrontSourceRoot",
	"ohrfrontTestRoot",
	"ohrfrontDocsRoot",
	"proceduralCoreRoot",
	"dynamicServerRoot",
	"aiThoughtsRoot",
	"aiThoughtsAliasRoot",
	"aiSessionRoot",
	"evidenceRoot",
	"remainingWork",
	"releaseEvidence",
	"absolutePathManifest",
	"absolutePathPrinter",
	"absolutePathEvidenceWriterCli"
]);

/**
 * @description Creates the complete immutable AI-handoff evidence record from one session-aware canonical path registry.
 * @param {object} yesodRegistry - Canonical registry exposing `get(key)` and `resolve(path, baseKey)`.
 * @param {string} chochmahSessionId - Validated AI session identity.
 * @param {string} malchusNodeExecutable - Absolute Node executable path supplied from `process.execPath`.
 * @returns {object} Frozen handoff record with filesystem, system, URL, and continuation-command branches.
 * @sideEffects Reads current registry evidence only; performs no writes.
 */
export function createHodAiAbsoluteHandoff(
	yesodRegistry,
	chochmahSessionId,
	malchusNodeExecutable
) {
	const hodFilesystem = createHodFilesystemMap(yesodRegistry);
	const hodSystem = Object.freeze({
		nodeExecutable: malchusNodeExecutable,
		handoffExecutable: resolveHodHandoffExecutable(yesodRegistry)
	});
	const hodUrls = Object.freeze({
		localOhrfront: "http://127.0.0.1:8080/games/ohrfront/"
	});
	return Object.freeze({
		schema: "awtsmoos.ai.absolute-handoff.v1",
		sessionId: chochmahSessionId,
		cwdIndependent: true,
		filesystem: hodFilesystem,
		system: hodSystem,
		urls: hodUrls,
		commands: createNetzachAbsoluteHandoffCommands(
			hodFilesystem,
			hodSystem,
			chochmahSessionId
		)
	});
}

/**
 * @description Projects all handoff-critical registry keys into one frozen semantic filesystem map.
 * @param {object} yesodRegistry - Session-aware canonical path registry.
 * @returns {object} Frozen path map keyed by stable semantic identity.
 * @sideEffects Reads registry records only.
 */
function createHodFilesystemMap(yesodRegistry) {
	const hodEntries = HOD_HANDOFF_KEYS.map(chochmahKey => [
		chochmahKey,
		projectHodPath(yesodRegistry.get(chochmahKey))
	]);
	return Object.freeze(Object.fromEntries(hodEntries));
}

/**
 * @description Projects only handoff-critical identity fields from one richer canonical registry record.
 * @param {object} hodRecord - Canonical path evidence record.
 * @returns {object} Frozen canonical/requested/existence/kind summary.
 * @sideEffects None.
 */
function projectHodPath(hodRecord) {
	return Object.freeze({
		canonicalPath: hodRecord.canonicalPath,
		requestedPath: hodRecord.requestedPath,
		exists: hodRecord.exists,
		kind: hodRecord.kind
	});
}

/**
 * @description Resolves this dedicated handoff executable through the canonical Ohrfront root instead of process cwd.
 * @param {object} yesodRegistry - Canonical path registry exposing CWD-independent `resolve`.
 * @returns {string} Canonical absolute handoff executable path.
 * @sideEffects None beyond registry resolution.
 */
function resolveHodHandoffExecutable(yesodRegistry) {
	return yesodRegistry.resolve(
		"tools/ai/MalchusPrintAiAbsoluteHandoff.mjs",
		"ohrfrontRoot"
	).canonicalPath;
}
