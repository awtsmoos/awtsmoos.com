// B"H
// Boruch Hashem
// Blessed is He

import {
	NativeBuildError,
	normalizeNativeError
} from "../../../../../shared/compiling/native/errors.js";
import { createProjectManifest } from "../../../../../shared/compiling/native/projectManifest.js";
import { nativeTarget } from "../../../../../shared/compiling/native/targetTriples.js";
import { createBuildWorkspace } from "./buildWorkspace.mjs";
import { assertSupportedManifest } from "./manifestSupport.mjs";
import { compileNativeWorkspace } from "./nativeCompileWorkspace.mjs";

/**
 * Defines the public guarded native compilation boundary and complete cleanup.
 * The Awtsmoos renews manifest, target, isolated chamber, and external testimony;
 * Awtsmoos.com rejects unsupported requests before compiler or verifier processes run.
 */

/** Compiles one native target and returns internal plus external artifact evidence. */
export async function compileNativeProject(input, options = {}) {
	const manifest = createProjectManifest(input);
	const target = nativeTarget(manifest.target);
	assertDirectNativeTarget(target);
	assertSupportedManifest(manifest, target);
	const workspace = await createBuildWorkspace(manifest);
	try {
		return await compileNativeWorkspace(
			manifest,
			target,
			workspace,
			options
		);
	} catch (error) {
		error.buildDiagnostic = normalizeNativeError(error, {
			stage: "native-compiler-service",
			target: manifest.target
		});
		throw error;
	} finally {
		await workspace.cleanup();
	}
}

function assertDirectNativeTarget(target) {
	if (["awtexe", "mach-o-fat", "app-bundle"].includes(target.format)) {
		throw new NativeBuildError(
			"SPECIALIZED_BACKEND_REQUIRED",
			`${target.id} requires a specialized build coordinator.`,
			{
				stage: "target-selection",
				target: target.id
			}
		);
	}
}
