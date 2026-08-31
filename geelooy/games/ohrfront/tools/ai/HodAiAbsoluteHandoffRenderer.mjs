// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAiAbsoluteHandoffRenderer.mjs
 * @description Builds immutable AI handoff evidence where canonical/legacy filesystem records, absolute executables, URLs, and continuation commands all descend from the same validated system truth.
 * Hod gives finite testimony while the Awtsmoos renews root, command, executable, and inheriting mind beyond every printed line;
 * Awtsmoos.com lets filesystem and command evidence share one frozen source, so no argument-order shadow can turn an absolute handoff back into relative night.
 */
import { createNetzachAbsoluteHandoffCommands } from "./NetzachAbsoluteHandoffCommands.mjs";

const HOD_HANDOFF_FILESYSTEM_KEYS = Object.freeze([
	"repositoryRoot",
	"ohrfrontRoot",
	"ohrfrontSourceRoot",
	"ohrfrontTestRoot",
	"ohrfrontDocsRoot",
	"proceduralCoreRoot",
	"dynamicServerRoot",
	"aiThoughtsRoot",
	"legacyAiThoughtsRoot",
	"aiThoughtsAliasRoot",
	"repositoryAiThoughtsRoot",
	"aiSessionRoot",
	"evidenceRoot",
	"remainingWork",
	"releaseEvidence",
	"absolutePathManifest",
	"absolutePathPrinter",
	"absolutePathEvidenceWriterCli"
]);

/**
 * @description Creates one complete immutable handoff from a validated session registry and verified absolute executable paths.
 * @param {object} yesodRegistry - Session-bound absolute-path registry.
 * @param {string} malchusNodeExecutable - Absolute Node executable used by continuation commands.
 * @param {string} malchusHandoffExecutable - Absolute handoff CLI path used by continuation commands.
 * @returns {object} Frozen structured handoff containing filesystem, system, URL, and command branches.
 * @sideEffects None.
 */
export function createHodAiAbsoluteHandoff(
	yesodRegistry,
	malchusNodeExecutable,
	malchusHandoffExecutable
) {
	if (!yesodRegistry?.chochmahSessionId) {
		throw new TypeError("AI absolute handoff requires a validated session registry.");
	}
	const hodFilesystem = Object.freeze(
		Object.fromEntries(
			HOD_HANDOFF_FILESYSTEM_KEYS.map(chochmahKey => [
				chochmahKey,
				yesodRegistry.get(chochmahKey)
			])
		)
	);
	const hodSystem = Object.freeze({
		nodeExecutable: malchusNodeExecutable,
		handoffExecutable: malchusHandoffExecutable
	});
	return Object.freeze({
		schema: "awtsmoos.ai.absolute-handoff.v1",
		sessionId: yesodRegistry.chochmahSessionId,
		cwdIndependent: true,
		filesystem: hodFilesystem,
		system: hodSystem,
		urls: Object.freeze({
			localOhrfront: "http://127.0.0.1:8080/games/ohrfront/"
		}),
		commands: createNetzachAbsoluteHandoffCommands(
			hodFilesystem,
			hodSystem,
			yesodRegistry.chochmahSessionId
		)
	});
}
