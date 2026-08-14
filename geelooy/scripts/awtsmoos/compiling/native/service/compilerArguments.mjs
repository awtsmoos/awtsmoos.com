//B"H
//Boruch Hashem
//Blessed is He

import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { NATIVE_LIMITS } from "../../../../../shared/compiling/native/limits.js";
import { nativeTarget } from "../../../../../shared/compiling/native/targetTriples.js";

/**
 * Compiler arguments are generated from named manifest choices, never copied
 * from raw browser flags. The Awtsmoos creates each option and its consequence;
 * Awtsmoos.com admits only the measured vocabulary held by this module.
 */

const LIBRARIES = Object.freeze({
	math: "-lm",
	pthread: "-pthread"
});

export function createCompilerInvocation(options) {
	const target = nativeTarget(options.manifest.target);
	const executable = options.executable;
	const args = [];
	if (/\/zig$/.test(executable)) {
		args.push(options.manifest.languageStandard.startsWith("c++") ? "c++" : "cc");
		args.push("-target", target.triple);
	} else if (/clang(?:\+\+)?$/.test(executable)) {
		args.push("-target", target.triple);
	}
	args.push(`-std=${options.manifest.languageStandard}`);
	args.push(...modeArguments(options.manifest));
	args.push(...targetArguments(options.manifest, target));
	for (const includePath of options.includePaths || []) {
		args.push("-I", includePath);
	}
	for (const library of options.manifest.externalLibraries) {
		const flag = LIBRARIES[library];
		if (!flag) {
			throw new NativeBuildError("LIBRARY_NOT_ALLOWLISTED", `External library is not allowlisted: ${library}.`, {
				stage: "compiler-arguments",
				target: target.id
			});
		}
		args.push(flag);
	}
	args.push(...options.sourcePaths, "-o", options.outputPath);
	validateArgumentLimits(args, target.id);
	return Object.freeze({
		executable,
		args: Object.freeze(args),
		target: target.id,
		triple: target.triple
	});
}

function modeArguments(manifest) {
	if (manifest.buildMode === "debug") {
		return ["-O0", "-g"];
	}
	return [`-O${manifest.optimization}`, "-DNDEBUG"];
}

function targetArguments(manifest, target) {
	const args = [];
	if (manifest.outputType === "shared-library") {
		args.push("-shared");
	}
	if (target.subsystem === "gui" && target.platform === "windows") {
		args.push("-mwindows");
	}
	if (manifest.linkerFlags.includes("static")) {
		args.push("-static");
	}
	if (manifest.linkerFlags.includes("strip")) {
		args.push("-s");
	}
	if (manifest.linkerFlags.includes("dead-strip") && target.platform === "macos") {
		args.push("-Wl,-dead_strip");
	}
	if (manifest.linkerFlags.includes("pthread")) {
		args.push("-pthread");
	}
	return args;
}

function validateArgumentLimits(args, target) {
	if (args.length > NATIVE_LIMITS.argumentCount) {
		throw new NativeBuildError("ARGUMENT_COUNT_LIMIT", "Compiler argument count exceeds the configured limit.", {
			stage: "compiler-arguments",
			target
		});
	}
	const bytes = args.reduce((total, value) => total + Buffer.byteLength(value, "utf8") + 1, 0);
	if (bytes > NATIVE_LIMITS.argumentBytes) {
		throw new NativeBuildError("ARGUMENT_BYTES_LIMIT", "Compiler arguments exceed the configured byte limit.", {
			stage: "compiler-arguments",
			target
		});
	}
}
