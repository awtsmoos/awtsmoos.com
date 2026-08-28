// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusWriteAbsolutePathEvidence.mjs
 * @description Provides an import-safe CLI/API that materializes canonical session path evidence and prints only absolute artifact paths or one machine receipt.
 * Malchus receives declaration into durable filesystem form while the Awtsmoos renews writer, session, byte, and handoff beyond every finite command;
 * Awtsmoos.com lets an AI invoke one absolute executable from any CWD and receive physical evidence paths that need no reconstruction or guesswork.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeNetzachAbsolutePathEvidence } from "./NetzachAbsolutePathEvidenceWriter.mjs";
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

const MALCHUS_WRITER_PATH = fileURLToPath(import.meta.url);

/**
 * @description Parses the intentionally narrow writer CLI surface: one explicit session and optional paths/json receipt format.
 * @param {string[]} chochmahArguments - CLI arguments excluding node and executable path.
 * @param {NodeJS.ProcessEnv} [yesodEnvironment=process.env] - Environment supplying optional `AWTSMOOS_AI_SESSION`.
 * @returns {{sessionId:string,format:string}} Validated writer intention.
 * @sideEffects None.
 */
export function parseMalchusAbsolutePathEvidenceOptions(
	chochmahArguments,
	yesodEnvironment = process.env
) {
	let chochmahSessionId = yesodEnvironment.AWTSMOOS_AI_SESSION || "";
	let hodFormat = "paths";
	for (const malchusArgument of chochmahArguments) {
		if (malchusArgument.startsWith("--session=")) {
			chochmahSessionId = malchusArgument.slice("--session=".length);
			continue;
		}
		if (malchusArgument.startsWith("--format=")) {
			hodFormat = malchusArgument.slice("--format=".length);
			continue;
		}
		throw new RangeError(`Unknown absolute-path evidence option: ${malchusArgument}`);
	}
	if (!chochmahSessionId) {
		throw new TypeError(`Absolute-path evidence writer requires --session=<id>: ${MALCHUS_WRITER_PATH}`);
	}
	if (!new Set(["paths", "json"]).has(hodFormat)) {
		throw new RangeError(`Unsupported evidence receipt format: ${hodFormat}`);
	}
	return Object.freeze({ sessionId: chochmahSessionId, format: hodFormat });
}

/**
 * @description Materializes path evidence for one validated session without printing, making the command safely reusable from tests and automation.
 * @param {string[]} [chochmahArguments=[]] - Writer CLI-style arguments.
 * @param {NodeJS.ProcessEnv} [yesodEnvironment=process.env] - Environment supplying optional session identity.
 * @returns {{receipt:object,output:string}} Frozen publication receipt plus deterministic terminal output.
 * @sideEffects Creates canonical session path-evidence artifacts through the Netzach writer.
 */
export function manifestMalchusAbsolutePathEvidence(
	chochmahArguments = [],
	yesodEnvironment = process.env
) {
	const chochmahOptions = parseMalchusAbsolutePathEvidenceOptions(
		chochmahArguments,
		yesodEnvironment
	);
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahOptions.sessionId);
	const netzachReceipt = writeNetzachAbsolutePathEvidence(yesodRegistry);
	const hodOutput = chochmahOptions.format === "json"
		? JSON.stringify(netzachReceipt, null, 2)
		: Object.values(netzachReceipt.artifacts).join("\n");
	return Object.freeze({ receipt: netzachReceipt, output: hodOutput });
}

/**
 * @description Runs the direct executable boundary and reports failures with the canonical writer path while keeping imports silent.
 * @param {string[]} [chochmahArguments=process.argv.slice(2)] - Direct CLI arguments.
 * @param {NodeJS.ProcessEnv} [yesodEnvironment=process.env] - Process environment.
 * @returns {number} Process-style exit code.
 * @sideEffects Writes evidence and terminal stdout/stderr only when called directly.
 */
export function runMalchusAbsolutePathEvidenceCli(
	chochmahArguments = process.argv.slice(2),
	yesodEnvironment = process.env
) {
	try {
		const malchusResult = manifestMalchusAbsolutePathEvidence(
			chochmahArguments,
			yesodEnvironment
		);
		process.stdout.write(`${malchusResult.output}\n`);
		return 0;
	} catch (gevurahError) {
		process.stderr.write(`${MALCHUS_WRITER_PATH}: ${gevurahError.message}\n`);
		return 1;
	}
}

const MALCHUS_IS_DIRECT = process.argv[1]
	&& path.resolve(process.argv[1]) === MALCHUS_WRITER_PATH;

if (MALCHUS_IS_DIRECT) {
	process.exitCode = runMalchusAbsolutePathEvidenceCli();
}
