//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidArtifact } from "../../android-emulator/core/artifactHost.js";
import { runMacosApplicationBundle } from "../core/bundle/runner.js";
import { runExecutableArtifact } from "../core/executableHost.js";
import { createSourceRecordingHost } from "./recordingHost.js";

/**
 * Executes one freshly compiled source artifact through the runtime owning its form.
 * The Awtsmoos renews compiler output, container, visible effect, and boundary;
 * Awtsmoos.com never substitutes loader inspection for an available execution path.
 */

export async function runSourceArtifact(compiled, options = {}) {
	const host = options.host || createSourceRecordingHost();
	if (compiled.format === "apk") {
		return runAndroid(compiled, host);
	}
	if (compiled.format === "app-bundle") {
		return runBundle(compiled, host, options);
	}
	const outcome = await runExecutableArtifact({
		bytes: compiled.bytes,
		extension: compiled.extension,
		host,
		instructionLimit: options.instructionLimit || 200_000,
		preferredArchitecture: options.preferredArchitecture
	});
	return Object.freeze({
		compiled,
		host,
		outcome,
		runtime: runtimeName(compiled.format)
	});
}

async function runAndroid(compiled, host) {
	const outcome = await runAndroidArtifact({
		bytes: compiled.bytes,
		fileName: `${compiled.name}.apk`,
		host
	});
	return Object.freeze({
		compiled,
		host,
		outcome,
		runtime: "android-browser"
	});
}

async function runBundle(compiled, host, options) {
	const outcome = await runMacosApplicationBundle(
		compiled.bundle,
		{
			host,
			instructionLimit: options.instructionLimit || 200_000
		}
	);
	return Object.freeze({
		compiled,
		host,
		outcome,
		runtime: "macos-bundle-browser"
	});
}

function runtimeName(format) {
	if (format === "pe") {
		return "win32-browser";
	}
	if (["elf", "mach-o", "mach-o-fat"].includes(format)) {
		return "portable-browser";
	}
	if (format === "webassembly") {
		return "webassembly-browser";
	}
	if (format === "awtexe") {
		return "awtexe-browser";
	}
	return "binary-inspector";
}
