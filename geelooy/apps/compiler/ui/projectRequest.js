//B"H
//Boruch Hashem
//Blessed is He

import { createProjectManifest } from "../../../shared/compiling/native/projectManifest.js";

/**
 * The visible editor updates one source while preserving its project siblings.
 * The Awtsmoos creates every buffer and target together; Awtsmoos.com submits
 * one versioned manifest shared by Apps Code, Compiler, and the native service.
 */

/** Creates a validated build manifest from compiler controls and source state. */
export function createCompilerProjectRequest(options = {}) {
	const mode = options.mode.currentMode();
	const target = options.elements.targetSelect.value;
	const inbound = options.mode.currentManifest?.() || null;
	const sourceFiles = sourceFilesFor(inbound, options.mode, mode);
	return createProjectManifest({
		...(inbound || {}),
		projectName: safeStem(options.mode.currentName()),
		sourceFiles,
		languageStandard: mode === "cpp" ? "c++20" : "c17",
		target,
		buildMode: options.elements.buildMode.value,
		optimization: options.elements.optimization.value,
		outputFilename: outputName(options, target),
		packagingPreference: options.elements.packaging.value,
		signingPreference: options.elements.signing.value,
		emulatorPreference: options.elements.emulator.value
	});
}

/** Browser-only modes may continue using the focused PE generator. */
export function browserCompilerRequest(options = {}) {
	return Object.freeze({
		mode: options.mode.currentMode(),
		source: options.mode.currentSource(),
		name: options.mode.currentName(),
		target: options.elements.targetSelect.value
	});
}

function sourceFilesFor(inbound, modeController, mode) {
	const activeName = leafName(modeController.currentName()) || defaultSourceName(mode);
	const activeContent = modeController.currentSource();
	if (!inbound?.sourceFiles?.length) {
		return [{ path: activeName, content: activeContent }];
	}
	const sources = inbound.sourceFiles.map((source, index) => ({
		path: source.path,
		content: index === 0 ? activeContent : source.content
	}));
	return sources;
}

function outputName(options, target) {
	const configured = options.elements.outputName.value.trim();
	if (configured) {
		return configured;
	}
	const base = safeStem(options.mode.currentName());
	if (target.startsWith("windows-")) {
		return `${base}.exe`;
	}
	if (target.startsWith("wasm")) {
		return `${base}.wasm`;
	}
	if (target === "awtsmoos-simulated") {
		return `${base}.awtexe`;
	}
	return base;
}

function defaultSourceName(mode) {
	return mode === "cpp" ? "program.cpp" : "program.c";
}

function safeStem(value) {
	return leafName(value).replace(/\.[^.]+$/, "").replace(/[^a-z0-9._-]+/gi, "-") || "awtsmoos-project";
}

function leafName(value = "") {
	return String(value).split(/[\\/]/).pop() || "";
}
