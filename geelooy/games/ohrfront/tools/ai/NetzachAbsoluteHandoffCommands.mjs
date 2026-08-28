// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAbsoluteHandoffCommands.mjs
 * @description Creates copy-pastable continuation commands whose executable, script, and evidence-file arguments are all absolute system paths.
 * Netzach carries continuation across agent and shell while the Awtsmoos renews command, path, mission, and inheriting mind beyond each finite line;
 * Awtsmoos.com lets the next worker endure without guessing PATH, cwd, symlink spelling, or where the remaining work was left behind in time.
 */

/**
 * @description Creates immutable absolute continuation commands from already-canonical handoff path and system evidence.
 * @param {object} hodFilesystem - Canonical handoff filesystem records keyed by semantic identity.
 * @param {object} hodSystem - Absolute system executable records including Node and the handoff CLI.
 * @param {string} chochmahSessionId - Validated current AI mission/session identifier.
 * @returns {object} Frozen command map safe to copy into a shell from any current working directory.
 * @sideEffects None.
 */
export function createNetzachAbsoluteHandoffCommands(
	hodFilesystem,
	hodSystem,
	chochmahSessionId
) {
	const netzachPrinter = hodFilesystem.absolutePathPrinter.canonicalPath;
	const netzachWriter = hodFilesystem.absolutePathEvidenceWriterCli.canonicalPath;
	const netzachRemaining = hodFilesystem.remainingWork.canonicalPath;
	const netzachNode = hodSystem.nodeExecutable;
	return Object.freeze({
		printSystemPaths: [
			quoteNetzachShellValue(netzachNode),
			quoteNetzachShellValue(netzachPrinter),
			`--session=${chochmahSessionId}`,
			"--format=system"
		].join(" "),
		writePathEvidence: [
			quoteNetzachShellValue(netzachNode),
			quoteNetzachShellValue(netzachWriter),
			`--session=${chochmahSessionId}`
		].join(" "),
		printHandoffJson: [
			quoteNetzachShellValue(netzachNode),
			quoteNetzachShellValue(hodSystem.handoffExecutable),
			`--session=${chochmahSessionId}`,
			"--json"
		].join(" "),
		readRemainingWork: createNetzachReadFileCommand(
			netzachNode,
			netzachRemaining
		)
	});
}

/**
 * @description Creates an absolute Node command that prints one evidence file without relying on `cat`, shell cwd, or shell PATH.
 * @param {string} malchusNodeExecutable - Absolute Node executable path.
 * @param {string} malchusEvidencePath - Absolute evidence-file path to print.
 * @returns {string} Copy-pastable Node file-reader command.
 * @sideEffects None.
 */
function createNetzachReadFileCommand(malchusNodeExecutable, malchusEvidencePath) {
	const chochmahProgram = "process.stdout.write(require('node:fs').readFileSync(process.argv[1],'utf8'))";
	return [
		quoteNetzachShellValue(malchusNodeExecutable),
		"-e",
		quoteNetzachShellValue(chochmahProgram),
		quoteNetzachShellValue(malchusEvidencePath)
	].join(" ");
}

/**
 * @description Quotes one finite path or inline program as a JSON-compatible double-quoted shell token.
 * @param {string} chochmahValue - Value that must remain one command token.
 * @returns {string} Double-quoted escaped token.
 * @sideEffects None.
 */
function quoteNetzachShellValue(chochmahValue) {
	return JSON.stringify(String(chochmahValue));
}
