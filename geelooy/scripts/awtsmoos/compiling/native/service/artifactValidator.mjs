//B"H
//Boruch Hashem
//Blessed is He

import { chmod, readFile, stat } from "node:fs/promises";
import { detectArtifactIdentity } from "../../../../../shared/compiling/native/artifactIdentity.js";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { NATIVE_LIMITS } from "../../../../../shared/compiling/native/limits.js";
import { nativeTarget } from "../../../../../shared/compiling/native/targetTriples.js";
import { sha256 } from "./checksum.mjs";

/**
 * Compilation is not complete when a process exits; the artifact must reveal
 * its true bytes. The Awtsmoos creates format and architecture together, while
 * Awtsmoos.com rejects every output whose measured identity misses its target.
 */

export async function validateBuiltArtifact(outputPath, targetId) {
	const target = nativeTarget(targetId);
	const metadata = await stat(outputPath).catch(() => null);
	if (!metadata?.isFile()) {
		throw new NativeBuildError("OUTPUT_MISSING", "Compiler did not create a regular output file.", {
			stage: "artifact-validation",
			target: targetId
		});
	}
	if (metadata.size > NATIVE_LIMITS.outputBytes) {
		throw new NativeBuildError("OUTPUT_SIZE_LIMIT", "Compiler output exceeds the configured size limit.", {
			stage: "artifact-validation",
			target: targetId,
			safeDetails: { outputBytes: metadata.size }
		});
	}
	if (isExecutableTarget(target)) {
		await chmod(outputPath, 0o755);
	}
	const bytes = await readFile(outputPath);
	const identity = detectArtifactIdentity(bytes, {
		manifest: { format: target.format }
	});
	validateArchitecture(identity, target);
	return Object.freeze({
		bytes,
		identity,
		sha256: sha256(bytes),
		byteLength: bytes.length,
		executablePermissions: isExecutableTarget(target)
	});
}

function validateArchitecture(identity, target) {
	if (target.architecture === "host" || target.architecture === "virtual") {
		return;
	}
	if (target.architecture === "universal") {
		const architectures = new Set(identity.slices?.map(slice => slice.architecture));
		if (!architectures.has("x86_64") || !architectures.has("arm64")) {
			throw architectureError(identity, target);
		}
		return;
	}
	if (identity.architecture !== target.architecture) {
		throw architectureError(identity, target);
	}
}

function architectureError(identity, target) {
	return new NativeBuildError("ARTIFACT_ARCHITECTURE_MISMATCH", `Expected ${target.architecture}, received ${identity.architecture}.`, {
		stage: "artifact-validation",
		target: target.id,
		safeDetails: {
			expectedArchitecture: target.architecture,
			detectedArchitecture: identity.architecture
		}
	});
}

function isExecutableTarget(target) {
	return target.outputType === "executable" && ["macos", "linux"].includes(target.platform);
}
