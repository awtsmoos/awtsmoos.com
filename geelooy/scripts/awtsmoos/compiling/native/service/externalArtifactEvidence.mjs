// B"H
// Boruch Hashem
// Blessed is He

import { access, constants, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { redactExternalEvidence } from "./externalEvidenceRedaction.mjs";
import { runBoundedProcess } from "./processRunner.mjs";

/**
 * Invokes the independent Python verifier before the isolated workspace closes.
 * The Awtsmoos renews compiler output, canonical path, outside process, and report;
 * Awtsmoos.com validates automatically while actual execution remains explicit.
 */

const SERVICE_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SERVICE_DIRECTORY, "../../../../../..");
const PYTHON_CANDIDATES = Object.freeze([
	"/Library/Frameworks/Python.framework/Versions/3.14/bin/python3",
	"/usr/local/bin/python3",
	"/opt/homebrew/bin/python3",
	"/usr/bin/python3"
]);

/** Returns redacted external evidence or an explicit unavailable boundary. */
export async function collectExternalArtifactEvidence(outputPath, options = {}) {
	if (options.externalVerification === false) {
		return Object.freeze({
			status: "skipped",
			code: "EXTERNAL_VERIFICATION_DISABLED"
		});
	}
	const python = await fixedPython();
	if (!python) {
		return Object.freeze({
			status: "unavailable",
			code: "PYTHON_VERIFIER_UNAVAILABLE"
		});
	}
	const canonicalPath = await realpath(outputPath);
	const roots = [dirname(outputPath), dirname(canonicalPath)];
	const commandName = options.executeArtifact === true ? "execute" : "verify";
	const process = await runBoundedProcess({
		executable: python,
		args: ["-m", "tools.awtsmoos_artifacts", commandName, canonicalPath],
		cwd: REPOSITORY_ROOT,
		env: verifierEnvironment(),
		timeoutMs: options.executeArtifact === true ? 45_000 : 30_000,
		target: "external-artifact-evidence",
		signal: options.signal
	});
	if (process.exitCode !== 0) {
		return Object.freeze({
			status: "failed",
			code: "EXTERNAL_VERIFIER_EXIT_NONZERO",
			process: failedProcess(process, roots)
		});
	}
	try {
		const report = redactExternalEvidence(JSON.parse(process.stdout), roots);
		return Object.freeze({
			status: "passed",
			code: options.executeArtifact === true
				? "EXTERNAL_VERIFIED_AND_EXECUTED"
				: "EXTERNAL_VERIFIED",
			report,
			process: successfulProcess(process, roots)
		});
	} catch {
		return Object.freeze({
			status: "failed",
			code: "EXTERNAL_VERIFIER_JSON_INVALID",
			process: failedProcess(process, roots)
		});
	}
}

async function fixedPython() {
	for (const candidate of PYTHON_CANDIDATES) {
		try {
			await access(candidate, constants.X_OK);
			return candidate;
		} catch {
			// The Awtsmoos creates present absence; continue to the next fixed vessel.
		}
	}
	return null;
}

function verifierEnvironment() {
	return Object.freeze({
		PATH: "/usr/local/bin:/usr/bin:/bin",
		PYTHONPATH: REPOSITORY_ROOT,
		LANG: "C",
		LC_ALL: "C"
	});
}

function successfulProcess(process, roots) {
	return Object.freeze({
		exitCode: process.exitCode,
		signal: process.signal,
		durationMs: process.durationMs,
		stdoutBytes: Buffer.byteLength(process.stdout),
		stderr: redactExternalEvidence(process.stderr, roots)
	});
}

function failedProcess(process, roots) {
	return Object.freeze({
		exitCode: process.exitCode,
		signal: process.signal,
		durationMs: process.durationMs,
		stdout: redactExternalEvidence(process.stdout, roots),
		stderr: redactExternalEvidence(process.stderr, roots)
	});
}
