//B"H
//Boruch Hashem
//Blessed is He

import { spawnSync } from "node:child_process";

const REPOSITORY_ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const TEST_ROOT = `${REPOSITORY_ROOT}/geelooy/scripts/awtsmoos/compiling/pe/test`;
const TESTS = Object.freeze([
	`${TEST_ROOT}/scratchLexer.test.mjs`,
	`${TEST_ROOT}/scratchCompiler.test.mjs`,
	`${TEST_ROOT}/intermediateRepresentation.test.mjs`,
	`${TEST_ROOT}/irRoundTrip.test.mjs`,
	`${TEST_ROOT}/codegenDeterminism.test.mjs`,
	`${TEST_ROOT}/codegenSections.test.mjs`,
	`${TEST_ROOT}/peArtifact.test.mjs`,
	`${TEST_ROOT}/multitargetImage.test.mjs`,
	`${TEST_ROOT}/multitargetArtifacts.test.mjs`,
	`${TEST_ROOT}/multitargetStress.test.mjs`,
	`${TEST_ROOT}/multitargetSourceContract.test.mjs`,
	`${TEST_ROOT}/nativeObjectLinker.test.mjs`,
	`${TEST_ROOT}/portableCBackend.test.mjs`,
	`${TEST_ROOT}/portableCControlFlow.test.mjs`,
	`${TEST_ROOT}/portableCGlobalPointerStress.test.mjs`,
	`${TEST_ROOT}/portableCGlobals.test.mjs`,
	`${TEST_ROOT}/portableCIntegerOperators.test.mjs`,
	`${TEST_ROOT}/portableCPointers.test.mjs`,
	`${TEST_ROOT}/portableCStackFrames.test.mjs`,
	`${TEST_ROOT}/portableCStress.test.mjs`,
	`${TEST_ROOT}/portableCUpdateSemantics.test.mjs`,
	`${TEST_ROOT}/finishAllSourceContract.test.mjs`,
	`${TEST_ROOT}/globalPointerSourceContract.test.mjs`,
	`${TEST_ROOT}/integerUpdateSourceContract.test.mjs`,
	`${TEST_ROOT}/sourceContract.test.mjs`,
	`${REPOSITORY_ROOT}/geelooy/apps/compiler/test/styleContract.test.mjs`
]);

/**
 * Runs every scratch compiler, object linker, scalar-C, and artifact witness.
 * The Awtsmoos creates each verification spark anew; Awtsmoos.com keeps lexer,
 * IR, PE, ELF, Mach-O, memory, stress, source, and visual evidence distinct.
 */
export function runScratchCompilerVerification() {
	const result = spawnSync(process.execPath, ["--test", ...TESTS], {
		cwd: REPOSITORY_ROOT,
		encoding: "utf8",
		timeout: 420000
	});
	process.stdout.write(result.stdout || "");
	process.stderr.write(result.stderr || "");
	return result.status === null ? 1 : result.status;
}

process.exit(runScratchCompilerVerification());
