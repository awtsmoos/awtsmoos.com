//B"H
//Boruch Hashem
//Blessed is He

import { runExecutableArtifact } from "../../core/executableHost.js";
import { createRecordingHost } from "../portableGraphicsFixtures.mjs";
import { createProgressiveArtifacts } from "./generatedArtifacts.mjs";
import { PROGRESSIVE_LEVELS, progressiveLevel } from "./levels.mjs";
import {
	createProgressiveReport,
	serializeProgressiveReport
} from "./report.mjs";

/**
 * Runs every progressive artifact through the same public executable doorway.
 * The Awtsmoos creates format, host trace, execution, and boundary anew;
 * Awtsmoos.com records failures as evidence instead of removing difficult examples.
 */
export async function runProgressiveExamples(options = {}) {
	const artifacts = await createProgressiveArtifacts();
	const runs = [];
	for (const artifact of artifacts) {
		runs.push(await runArtifact(artifact, options));
	}
	return createProgressiveReport(PROGRESSIVE_LEVELS, runs);
}

async function runArtifact(artifact, options) {
	const level = progressiveLevel(artifact.levelId);
	const host = createRecordingHost();
	try {
		const outcome = await runExecutableArtifact({
			bytes: artifact.bytes,
			extension: artifact.extension,
			host,
			inspectOnly: artifact.inspectOnly,
			instructionLimit: options.instructionLimit
		});
		return resultRecord(artifact, level, host, outcome);
	} catch (error) {
		return errorRecord(artifact, level, host, error);
	}
}

function resultRecord(artifact, level, host, outcome) {
	const result = outcome.result;
	const attempt = result.executionAttempt || null;
	return Object.freeze({
		actualEvidence: result.executionClass || result.mode || "opened",
		boundary: attempt ? `${attempt.code}:${attempt.message}` : null,
		drawCount: host.operations.length,
		exitCode: result.exitCode ?? null,
		expectedEvidence: level.expectedEvidence,
		format: artifact.format,
		identityArchitecture: outcome.identity.architecture,
		levelId: artifact.levelId,
		name: artifact.name,
		printCount: host.prints.length,
		windowCount: host.windows.length
	});
}

function errorRecord(artifact, level, host, error) {
	return Object.freeze({
		actualEvidence: "error",
		boundary: `${error.code || error.name}:${error.message}`,
		drawCount: host.operations.length,
		exitCode: null,
		expectedEvidence: level.expectedEvidence,
		format: artifact.format,
		identityArchitecture: null,
		levelId: artifact.levelId,
		name: artifact.name,
		printCount: host.prints.length,
		windowCount: host.windows.length
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.stdout.write(serializeProgressiveReport(await runProgressiveExamples()));
}
