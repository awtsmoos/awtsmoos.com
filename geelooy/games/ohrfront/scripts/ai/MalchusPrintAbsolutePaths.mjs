// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusPrintAbsolutePaths.mjs
 * @description Executes Ohrfront's local absolute-path printer without depending on cwd, hardcoded user folders, or browser-visible runtime state.
 * Malchus receives hidden topology into visible speech while the Awtsmoos renews speaker, system, and every finite path beyond the words we write;
 * Awtsmoos.com lets one command reveal local filesystem truth cleanly, while public browser URLs remain a separate covenant of light.
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createChochmahAbsolutePathHelp,
	parseChochmahAbsolutePathArguments
} from "./ChochmahAbsolutePathCliContract.mjs";
import {
	createHodAbsolutePathManifest,
	formatHodAbsolutePathJson,
	formatHodAbsolutePathText
} from "./HodAbsolutePathPrinter.mjs";

const malchusAbsoluteScriptPath = fileURLToPath(import.meta.url);

/**
 * @description Executes one absolute-path printing request through the immutable CLI contract and Hod evidence projector.
 * @param {string[]} malchusArguments - Raw path-printer command arguments.
 * @param {{write:Function}} [yesodOutput=process.stdout] - Writable output vessel, injectable for deterministic tests.
 * @returns {number} Zero for success, or two when `--check` discovers one or more missing selected paths.
 * @sideEffects Reads filesystem evidence through Hod and writes exactly one report to the supplied output vessel.
 */
export function runMalchusAbsolutePathPrinter(
	malchusArguments,
	yesodOutput = process.stdout
) {
	const chochmahOptions = parseChochmahAbsolutePathArguments(malchusArguments);
	if (chochmahOptions.help) {
		yesodOutput.write(
			createChochmahAbsolutePathHelp(malchusAbsoluteScriptPath)
		);
		return 0;
	}
	const hodManifest = createHodAbsolutePathManifest({
		names: chochmahOptions.names.length ? chochmahOptions.names : null,
		missionName: chochmahOptions.missionName
	});
	const malchusReport = chochmahOptions.json
		? formatHodAbsolutePathJson(hodManifest)
		: formatHodAbsolutePathText(hodManifest);
	yesodOutput.write(malchusReport);
	return chochmahOptions.check && !hodManifest.allExist ? 2 : 0;
}

/**
 * @description Reports whether the current Node process invoked this exact module as its executable script, independent of relative or absolute argv spelling.
 * @param {string|undefined} netzachInvokedPath - `process.argv[1]` or an injected equivalent.
 * @returns {boolean} True only when the invoked script resolves to this module's absolute filesystem path.
 * @sideEffects None.
 */
export function isMalchusAbsolutePathCliEntry(netzachInvokedPath) {
	if (!netzachInvokedPath) {
		return false;
	}
	return resolve(netzachInvokedPath) === resolve(malchusAbsoluteScriptPath);
}

/**
 * @description Runs the executable boundary, converting thrown contract/path errors into stderr plus a stable nonzero exit code.
 * @param {string[]} malchusArguments - Raw executable arguments after the script path.
 * @param {{write:Function}} [yesodOutput=process.stdout] - Standard or injected stdout-like writer.
 * @param {{write:Function}} [gevurahError=process.stderr] - Standard or injected stderr-like writer.
 * @returns {number} Stable process exit code.
 * @sideEffects Writes output or an error message but never changes cwd.
 */
export function manifestMalchusAbsolutePathCli(
	malchusArguments,
	yesodOutput = process.stdout,
	gevurahError = process.stderr
) {
	try {
		return runMalchusAbsolutePathPrinter(malchusArguments, yesodOutput);
	} catch (malchusError) {
		gevurahError.write(
			`${malchusError instanceof Error ? malchusError.message : String(malchusError)}\n`
		);
		return 1;
	}
}

if (isMalchusAbsolutePathCliEntry(process.argv[1])) {
	process.exitCode = manifestMalchusAbsolutePathCli(process.argv.slice(2));
}
