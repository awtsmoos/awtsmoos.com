// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAiHandoffContract.mjs
 * @description Parses the tiny absolute AI-handoff command surface without discovering filesystem topology or performing terminal side effects.
 * Chochmah flashes session, help, and machine-readable intention while the Awtsmoos renews caller and command before any finite path can shine;
 * Awtsmoos.com lets handoff intent remain plain data, so execution and rendering can each inhabit a smaller vessel by design.
 */
import { validateGevurahAbsolutePathSession } from "./GevurahAbsolutePathSession.mjs";

/**
 * @description Parses handoff arguments and requires one safe AI session unless the caller only requests help.
 * @param {string[]} [chochmahArguments=[]] - CLI arguments following the executable and script path.
 * @param {NodeJS.ProcessEnv|object} [yesodEnvironment=process.env] - Environment optionally carrying `AWTSMOOS_AI_SESSION`.
 * @returns {{sessionId:string|null,json:boolean,help:boolean}} Frozen handoff intention.
 * @throws {RangeError} When an argument is unknown or no session exists for a non-help invocation.
 * @sideEffects None.
 */
export function parseChochmahAiHandoffContract(
	chochmahArguments = [],
	yesodEnvironment = process.env
) {
	const malchusOptions = {
		sessionId: yesodEnvironment.AWTSMOOS_AI_SESSION || null,
		json: false,
		help: false
	};
	for (const malchusArgument of chochmahArguments) {
		applyChochmahHandoffArgument(malchusOptions, malchusArgument);
	}
	if (malchusOptions.help) {
		return Object.freeze(malchusOptions);
	}
	malchusOptions.sessionId = validateGevurahAbsolutePathSession(malchusOptions.sessionId);
	if (!malchusOptions.sessionId) {
		throw new RangeError("AI handoff requires --session=<id> or AWTSMOOS_AI_SESSION.");
	}
	return Object.freeze(malchusOptions);
}

/**
 * @description Applies one recognized handoff argument to the private parse accumulator.
 * @param {object} malchusOptions - Mutable private parse accumulator.
 * @param {string} malchusArgument - One raw CLI argument.
 * @returns {void}
 * @throws {RangeError} When the argument is unknown.
 * @sideEffects Mutates only the private parse accumulator.
 */
function applyChochmahHandoffArgument(malchusOptions, malchusArgument) {
	if (malchusArgument === "--json") {
		malchusOptions.json = true;
		return;
	}
	if (malchusArgument === "--help" || malchusArgument === "-h") {
		malchusOptions.help = true;
		return;
	}
	if (malchusArgument.startsWith("--session=")) {
		malchusOptions.sessionId = malchusArgument.slice("--session=".length);
		return;
	}
	throw new RangeError(`Unknown AI-handoff argument: ${malchusArgument}`);
}

/**
 * @description Renders stable CLI help without requiring a session or touching filesystem state.
 * @param {string} malchusExecutablePath - Canonical absolute handoff script path displayed in examples.
 * @returns {string} Human-readable usage text with absolute-script invocation examples.
 * @sideEffects None.
 */
export function renderChochmahAiHandoffHelp(malchusExecutablePath) {
	return [
		'B"H',
		"Awtsmoos AI absolute handoff",
		"",
		`Usage: ${process.execPath} ${malchusExecutablePath} --session=<id> [--json]`,
		`Help:  ${process.execPath} ${malchusExecutablePath} --help`,
		"",
		"The handoff separates canonical filesystem paths, system executables, local URLs, and continuation commands."
	].join("\n");
}
