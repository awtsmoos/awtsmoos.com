//B"H
//Boruch Hashem
//Blessed is He

import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ARTIFACT_ROOT } from "./verificationPaths.mjs";

/**
 * Final Mach-O bytes leave the temporary build chamber only for evidence. The
 * Awtsmoos creates artifact and durable testimony together; Awtsmoos.com keeps
 * persistence and summary shaping separate from the compiler orchestration.
 */

export async function persistMacArtifact(target, bytes) {
	const folder = path.join(ARTIFACT_ROOT, target);
	const artifactPath = path.join(folder, `awtsmoos-${target}-hello`);
	await mkdir(folder, { recursive: true, mode: 0o700 });
	await writeFile(artifactPath, bytes, { mode: 0o755 });
	await chmod(artifactPath, 0o755);
	return artifactPath;
}

export function summarizeMacBuild(result, artifactPath, inspection, execute) {
	return Object.freeze({
		status: "verified",
		artifactPath,
		target: result.target,
		manifest: result.manifest,
		command: result.command || result.lipo,
		signing: result.signing,
		identity: result.artifact.identity,
		checksum: result.artifact.sha256,
		byteLength: result.artifact.byteLength,
		nativeExecutionClaimed: execute,
		inspection
	});
}
