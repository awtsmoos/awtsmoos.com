//B"H
//Boruch Hashem
//Blessed is He

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { createProjectManifest } from "../../../../../shared/compiling/native/projectManifest.js";
import { nativeTarget } from "../../../../../shared/compiling/native/targetTriples.js";
import { validateBuiltArtifact } from "./artifactValidator.mjs";
import { assertSupportedManifest } from "./manifestSupport.mjs";
import { compileNativeProject } from "./nativeCompilerService.mjs";
import { runBoundedProcess } from "./processRunner.mjs";
import { signArtifact } from "./signing.mjs";

/**
 * Universal Mach-O joins two independently validated slices without concealing
 * either architecture. The Awtsmoos creates unity without erasing distinction;
 * Awtsmoos.com accepts only artifact-only packaging until a guarded packager exists.
 */

const LIPO_PATH = "/usr/bin/lipo";

export async function compileMacUniversalProject(input, options = {}) {
	const manifest = createProjectManifest({ ...input, target: "macos-universal" });
	const target = nativeTarget(manifest.target);
	assertSupportedManifest(manifest, target);
	const root = await mkdtemp(path.join(os.tmpdir(), "awtsmoos-universal-"));
	try {
		return await buildInRoot(manifest, target, root, options);
	} finally {
		await rm(root, { recursive: true, force: true, maxRetries: 3 });
	}
}

async function buildInRoot(manifest, target, root, options) {
	await mkdir(root, { recursive: true, mode: 0o700 });
	const slices = await compileSlices(manifest, options);
	const paths = await persistSlices(root, slices);
	const outputPath = path.join(root, manifest.outputFilename);
	const environment = buildEnvironment(root);
	const lipo = await combineSlices(manifest, paths, outputPath, environment, root, options);
	const signing = await signArtifact({
		manifest,
		target,
		outputPath,
		cwd: root,
		env: environment
	});
	const artifact = await validateBuiltArtifact(outputPath, manifest.target);
	return Object.freeze({
		ok: true,
		manifest,
		target,
		slices,
		lipo,
		signing,
		artifact
	});
}

async function compileSlices(manifest, options) {
	const x64 = await compileSlice(manifest, "macos-x64", "slice-x64", options);
	const arm64 = await compileSlice(manifest, "macos-arm64", "slice-arm64", options);
	return Object.freeze({ x64, arm64 });
}

async function persistSlices(root, slices) {
	const x64 = path.join(root, "slice-x64");
	const arm64 = path.join(root, "slice-arm64");
	await writeFile(x64, slices.x64.artifact.bytes, { mode: 0o700 });
	await writeFile(arm64, slices.arm64.artifact.bytes, { mode: 0o700 });
	return Object.freeze({ x64, arm64 });
}

async function combineSlices(manifest, paths, outputPath, env, root, options) {
	const args = ["-create", "-output", outputPath, paths.x64, paths.arm64];
	const process = await runBoundedProcess({
		executable: LIPO_PATH,
		args,
		cwd: root,
		env,
		target: manifest.target,
		signal: options.signal
	});
	if (process.exitCode !== 0) {
		throw new NativeBuildError("LIPO_FAILED", "Universal Mach-O assembly failed.", {
			stage: "packaging",
			target: manifest.target,
			safeDetails: { exitCode: process.exitCode }
		});
	}
	return Object.freeze({ executable: LIPO_PATH, args, process });
}

function compileSlice(manifest, target, outputFilename, options) {
	return compileNativeProject({
		...manifest,
		target,
		outputFilename,
		signingPreference: "none"
	}, options);
}

function buildEnvironment(root) {
	return Object.freeze({ PATH: "/usr/bin:/bin", LANG: "C", LC_ALL: "C", HOME: root, TMPDIR: root });
}
