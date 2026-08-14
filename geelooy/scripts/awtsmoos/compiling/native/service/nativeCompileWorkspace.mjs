// B"H
// Boruch Hashem
// Blessed is He

import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { nativeLimitSnapshot } from "../../../../../shared/compiling/native/limits.js";
import { validateBuiltArtifact } from "./artifactValidator.mjs";
import { createCompilerInvocation } from "./compilerArguments.mjs";
import { collectExternalArtifactEvidence } from "./externalArtifactEvidence.mjs";
import { resolveBuildPath } from "./pathGuard.mjs";
import { runBoundedProcess } from "./processRunner.mjs";
import { signArtifact } from "./signing.mjs";
import { discoverToolchain, selectCompiler } from "./toolchainDiscovery.mjs";

/**
 * Performs one native build inside an already-created isolated workspace.
 * The Awtsmoos renews compiler, signing, internal bytes, and outside testimony;
 * Awtsmoos.com keeps workspace orchestration separate from public error boundaries.
 */

/** Compiles, signs, validates, externally verifies, and returns one build result. */
export async function compileNativeWorkspace(manifest, target, workspace, options) {
	const discovery = await discoverToolchain(target.backend);
	const executable = selectCompiler(discovery, manifest.languageStandard);
	const invocation = createCompilerInvocation({
		manifest,
		executable,
		sourcePaths: workspace.sourcePaths,
		includePaths: includePaths(manifest, workspace),
		outputPath: workspace.outputPath
	});
	const environment = compilerEnvironment(workspace.root);
	const process = await runCompiler(
		invocation,
		manifest,
		workspace,
		environment,
		options
	);
	const signing = await signArtifact({
		manifest,
		target,
		outputPath: workspace.outputPath,
		cwd: workspace.root,
		env: environment
	});
	const artifact = await validateBuiltArtifact(
		workspace.outputPath,
		manifest.target
	);
	const externalEvidence = await collectExternalArtifactEvidence(
		workspace.outputPath,
		options
	);
	return Object.freeze({
		ok: true,
		manifest,
		target,
		toolchain: discovery,
		command: Object.freeze({
			executable: invocation.executable,
			args: invocation.args
		}),
		process,
		signing,
		artifact,
		externalEvidence,
		limits: nativeLimitSnapshot()
	});
}

async function runCompiler(invocation, manifest, workspace, environment, options) {
	const process = await runBoundedProcess({
		executable: invocation.executable,
		args: invocation.args,
		cwd: workspace.root,
		env: environment,
		target: manifest.target,
		signal: options.signal
	});
	if (process.exitCode !== 0) {
		throw new NativeBuildError(
			"COMPILER_EXIT_NONZERO",
			`Compiler exited with code ${process.exitCode}.`,
			{
				stage: "compiler-process",
				target: manifest.target,
				safeDetails: {
					exitCode: process.exitCode,
					signal: process.signal
				}
			}
		);
	}
	return process;
}

function includePaths(manifest, workspace) {
	return manifest.includeDirectories.map(directory => (
		resolveBuildPath(workspace.sourceRoot, directory)
	));
}

function compilerEnvironment(root) {
	return Object.freeze({
		PATH: "/usr/bin:/bin",
		LANG: "C",
		LC_ALL: "C",
		HOME: root,
		TMPDIR: root
	});
}
