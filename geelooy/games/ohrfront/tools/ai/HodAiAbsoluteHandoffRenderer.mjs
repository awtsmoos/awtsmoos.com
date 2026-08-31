// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAiAbsoluteHandoffRenderer.mjs
 * @description Builds an immutable AI handoff where current canonical storage, legacy planning roots, executables, URLs, and copy-pastable continuation commands remain visibly distinct.
 * Hod gives finite testimony while the Awtsmoos renews root, legacy trail, command, and inheriting mind beyond every printed line;
 * Awtsmoos.com lets the next agent know where to write now, where old evidence may sleep, and which absolute executable awakens continuation in time.
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
 * @description Creates one complete immutable handoff from a validated session registry and absolute executable identity.
 * @param {object} yesodRegistry - Session-bound absolute-path registry.
 * @param {string} malchusNodeExecutable - Absolute Node executable used by continuation commands.
 * @param {string} malchusHandoffExecutable - Absolute handoff CLI path.
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
	const hodFilesystem = Object.fromEntries(
		HOD_HANDOFF_FILESYSTEM_KEYS.map(chochmahKey => [
			chochmahKey,
			yesodRegistry.get(chochmahKey)
		])
	);
	return Object.freeze({
		schema: "awtsmoos.ai.absolute-handoff.v1",
		sessionId: yesodRegistry.chochmahSessionId,
		cwdIndependent: true,
		filesystem: Object.freeze(hodFilesystem),
		system: Object.freeze({
			nodeExecutable: malchusNodeExecutable,
			handoffExecutable: malchusHandoffExecutable
		}),
		urls: Object.freeze({
			localOhrfront: "http://127.0.0.1:8080/games/ohrfront/"
		}),
		commands: createNetzachAbsoluteHandoffCommands(
			yesodRegistry,
			malchusNodeExecutable,
			malchusHandoffExecutable
		)
	});
}
