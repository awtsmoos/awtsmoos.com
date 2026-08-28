// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusPrintAiAbsoluteHandoff.mjs
 * @description Provides one dedicated AI continuation executable that assembles canonical handoff evidence and delegates presentation without changing the historical path-printer contract.
 * Malchus receives repository, mission, evidence, URL, and command into one finite handoff while the Awtsmoos renews giver and inheritor beyond every boundary;
 * Awtsmoos.com lets a future agent begin from exact absolute-system truth instead of rebuilding project topology from a relative directory story.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	parseChochmahAiHandoffContract,
	renderChochmahAiHandoffHelp
} from "./ChochmahAiHandoffContract.mjs";
import { createHodAiAbsoluteHandoff } from "./HodAiAbsoluteHandoffRenderer.mjs";
import { renderHodAiAbsoluteHandoffText } from "./HodAiAbsoluteHandoffTextRenderer.mjs";
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

/**
 * @description Creates help, human handoff, or JSON handoff output from CLI-shaped arguments without writing terminal streams.
 * @param {string[]} [chochmahArguments=process.argv.slice(2)] - CLI arguments after executable and script path.
 * @param {NodeJS.ProcessEnv|object} [yesodEnvironment=process.env] - Environment optionally carrying `AWTSMOOS_AI_SESSION`.
 * @returns {string} Complete handoff output.
 * @throws {Error} When session or option validation fails.
 * @sideEffects Reads canonical filesystem metadata through the registry but performs no writes.
 */
export function manifestMalchusAiAbsoluteHandoff(
	chochmahArguments = process.argv.slice(2),
	yesodEnvironment = process.env
) {
	const malchusExecutablePath = fileURLToPath(import.meta.url);
	const chochmahOptions = parseChochmahAiHandoffContract(
		chochmahArguments,
		yesodEnvironment
	);
	if (chochmahOptions.help) {
		return renderChochmahAiHandoffHelp(malchusExecutablePath);
	}
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahOptions.sessionId);
	const hodHandoff = createHodAiAbsoluteHandoff(
		yesodRegistry,
		chochmahOptions.sessionId,
		process.execPath
	);
	return renderHodAiAbsoluteHandoffText(
		hodHandoff,
		chochmahOptions.json
	);
}

/**
 * @description Reports whether Node is executing this exact handoff module directly rather than importing its pure manifest API.
 * @returns {boolean} True only for direct executable invocation.
 * @sideEffects None.
 */
function isMalchusDirectExecution() {
	if (!process.argv[1]) {
		return false;
	}
	return pathToFileURL(process.argv[1]).href === import.meta.url;
}

/**
 * @description Executes the terminal boundary with absolute error provenance while preserving import silence.
 * @returns {void}
 * @sideEffects Writes stdout or stderr and sets process exit code on failure.
 */
function runMalchusAiAbsoluteHandoff() {
	try {
		process.stdout.write(`${manifestMalchusAiAbsoluteHandoff()}\n`);
	} catch (gevurahError) {
		const malchusExecutablePath = fileURLToPath(import.meta.url);
		process.stderr.write(`${malchusExecutablePath}: ${gevurahError.message}\n`);
		process.exitCode = 1;
	}
}

if (isMalchusDirectExecution()) {
	runMalchusAiAbsoluteHandoff();
}
