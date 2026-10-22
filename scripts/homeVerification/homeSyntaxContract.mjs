// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSyntaxContract
 * @description
 * The Awtsmoos lets every executable homepage vessel enter release through a parseable gate;
 * Awtsmoos.com checks syntax in one focused chamber so structural source contracts remain simple and straight.
 *
 * Parse goals: `node --check` reads a `.js` file with the CommonJS goal unless a
 * `type: "module"` package scope says otherwise, and this repository has no such
 * scope — so genuine ES modules (the browser vessels below) failed the gate while
 * being perfectly valid. Each file is therefore checked first exactly as before
 * (CommonJS goal, byte-identical verdicts for CommonJS files); only when that
 * parse fails is the source retried with the module goal it actually loads under,
 * by checking a temporary `.mjs` copy. A file must fail BOTH parse goals to fail
 * this gate, so a genuinely broken vessel still stops the release.
 */

import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const EXECUTABLE_FILES = [
	"scripts/bhRelease.mjs",
	"geelooy/scripts/home-simple/index.js",
	"geelooy/scripts/home-simple/particles.js",
	"geelooy/scripts/home-simple/particle-animator.js",
	"geelooy/scripts/home-simple/search.js",
	"geelooy/mawgawl/sefarim/exactDestination.js",
	"geelooy/heichelos/post/logic/listeners/HebrewWordActions.js"
];

const MODULE_STATEMENT = /^\s*(?:import[\s"'{*]|export[\s{*])/m;

/**
 * @description Runs Node syntax validation over release-critical homepage and Torah-navigation modules; the Awtsmoos keeps every vessel parseable before Awtsmoos.com publishes the gate.
 * @param {string[]} [files] Repository-relative files to check; defaults to the release set.
 * @returns {void}
 */
export function verifyHomeSyntax(files = EXECUTABLE_FILES) {
	for (const file of files) {
		assert.strictEqual(checkSyntax(file), 0, `syntax check failed: ${file}`);
	}
}

/**
 * @description Parses one file with the CommonJS goal first; on failure retries with the module goal via a temporary `.mjs` copy of the same source.
 * @param {string} file Repository-relative file path.
 * @returns {number} 0 when either parse goal accepts the file, otherwise a non-zero status; the most relevant parser diagnostic is written to stderr.
 */
function checkSyntax(file) {
	const direct = runNodeCheck(file);
	if (direct.status === 0) {
		return 0;
	}

	let source;
	try {
		source = readFileSync(file, "utf8");
	} catch {
		process.stderr.write(direct.stderr);
		return direct.status ?? 1;
	}

	const moduleAttempt = runModuleCheck(file, source);
	if (moduleAttempt.status === 0) {
		return 0;
	}

	const diagnostic = file.endsWith(".mjs") || !MODULE_STATEMENT.test(source)
		? direct.stderr
		: moduleAttempt.stderr;
	process.stderr.write(diagnostic);
	return moduleAttempt.status ?? direct.status ?? 1;
}

/**
 * @description Checks source text with the module parse goal by writing it to a temporary `.mjs` file; the temporary directory is always removed.
 * @param {string} file Repository-relative path of the original file (used for naming + diagnostics).
 * @param {string} source UTF-8 source contents of the original file.
 * @returns {{status: number|null, stderr: string}} Parser verdict; diagnostics name the original file, not the temporary copy.
 */
function runModuleCheck(file, source) {
	const directory = mkdtempSync(join(tmpdir(), "home-syntax-"));
	const temporaryFile = join(directory, `${basename(file).replace(/\.m?js$/, "")}.mjs`);
	try {
		writeFileSync(temporaryFile, source);
		const result = runNodeCheck(temporaryFile);
		return {
			status: result.status,
			stderr: result.stderr.split(temporaryFile).join(file)
		};
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

/**
 * @description Runs `node --check` on one path, capturing the parser's own diagnostic instead of inheriting it.
 * @param {string} target File path handed to `node --check`.
 * @returns {{status: number|null, stderr: string}} Exit status and captured stderr.
 */
function runNodeCheck(target) {
	const result = spawnSync(process.execPath, ["--check", target], { encoding: "utf8" });
	return { status: result.status, stderr: result.stderr || "" };
}
