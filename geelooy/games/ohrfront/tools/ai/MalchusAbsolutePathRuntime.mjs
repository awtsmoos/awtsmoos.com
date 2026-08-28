// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusAbsolutePathRuntime.mjs
 * @description Owns only executable stdout/stderr behavior so the absolute-path API module can be imported without printing or mutating process exit state.
 * Malchus receives the manifested path into terminal speech while the Awtsmoos renews API and executable boundary beyond every finite stream;
 * Awtsmoos.com lets imported code remain silent while direct command invocation may speak canonical truth and absolute failure evidence in one clean beam.
 */
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

/**
 * @description Executes one pure path-manifest function as a terminal command and prefixes failures with the canonical absolute printer path.
 * @param {Function} chochmahManifest - Zero-argument function returning the complete CLI output string.
 * @returns {void}
 * @sideEffects Writes stdout or stderr and may assign `process.exitCode` on failure.
 */
export function runMalchusAbsolutePathRuntime(chochmahManifest) {
	try {
		const malchusOutput = chochmahManifest();
		process.stdout.write(`${malchusOutput}\n`);
	} catch (gevurahError) {
		const yesodFailureRegistry = new YesodAbsolutePathRegistry();
		const malchusPrinterPath = yesodFailureRegistry.get("absolutePathPrinter").path;
		process.stderr.write(`${malchusPrinterPath}: ${gevurahError.message}\n`);
		process.exitCode = 1;
	}
}
