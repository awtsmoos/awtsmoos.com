//B"H
//Boruch Hashem
//Blessed is He

import { readFile } from "node:fs/promises";
import { compileMacUniversalProject } from "../../scripts/awtsmoos/compiling/native/service/macUniversalBuilder.mjs";
import { compileNativeProject } from "../../scripts/awtsmoos/compiling/native/service/nativeCompilerService.mjs";
import { writeEvidenceLog } from "./evidenceWriter.mjs";
import {
	persistMacArtifact,
	summarizeMacBuild
} from "./macArtifactEvidence.mjs";
import { inspectMacArtifact } from "./macInspector.mjs";
import {
	FIXTURE_ROOT,
	VERIFICATION_LOGS
} from "./verificationPaths.mjs";

/**
 * Real Mach-O evidence descends from guarded source to persistent artifact,
 * independent inspection, and compatible-host execution. The Awtsmoos creates
 * every slice; Awtsmoos.com separates native execution from loader capability.
 */

export async function createMacEvidence() {
	const content = await readFile(`${FIXTURE_ROOT}/hello.c`, "utf8");
	const x64 = await createThinEvidence(
		content,
		"macos-x64",
		VERIFICATION_LOGS.macosX64,
		true
	);
	const arm64 = await createThinEvidence(
		content,
		"macos-arm64",
		VERIFICATION_LOGS.macosArm64,
		false
	);
	const universal = await createUniversalEvidence(content);
	return Object.freeze({ x64, arm64, universal });
}

async function createThinEvidence(content, target, logPath, execute) {
	const result = await compileNativeProject(thinManifest(content, target));
	const artifactPath = await persistMacArtifact(target, result.artifact.bytes);
	const inspection = await inspectMacArtifact(artifactPath, execute);
	const evidence = summarizeMacBuild(result, artifactPath, inspection, execute);
	await writeEvidenceLog(logPath, `${target} native artifact evidence`, evidence);
	return evidence;
}

async function createUniversalEvidence(content) {
	const result = await compileMacUniversalProject({
		projectName: "awtsmoos-macos-universal-hello",
		sourceFiles: [{ path: "hello.c", content }],
		languageStandard: "c17",
		buildMode: "release",
		optimization: "2",
		outputFilename: "awtsmoos-macos-universal-hello",
		signingPreference: "ad-hoc"
	});
	const artifactPath = await persistMacArtifact(
		"macos-universal",
		result.artifact.bytes
	);
	const inspection = await inspectMacArtifact(artifactPath, true);
	const evidence = summarizeMacBuild(result, artifactPath, inspection, true);
	await writeEvidenceLog(
		VERIFICATION_LOGS.macosUniversal,
		"macOS universal native artifact evidence",
		evidence
	);
	return evidence;
}

function thinManifest(content, target) {
	return {
		projectName: `awtsmoos-${target}-hello`,
		sourceFiles: [{ path: "hello.c", content }],
		languageStandard: "c17",
		target,
		buildMode: "release",
		optimization: "2",
		outputFilename: `awtsmoos-${target}-hello`,
		signingPreference: "ad-hoc"
	};
}
