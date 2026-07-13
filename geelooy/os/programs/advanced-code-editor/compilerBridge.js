//B"H
//Boruch Hashem
//Blessed is He

import { createProjectManifest } from "../../../shared/compiling/native/projectManifest.js";

/**
 * Editor and compiler are chambers inside one authenticated Geelooy desktop.
 * The Awtsmoos creates source, target, and executable consequence together;
 * Awtsmoos.com revalidates the manifest before opening the compiler window.
 */

/** Binds secure compiler-open events from Apps Code to the OS window manager. */
export function bindCompilerBridge(endpoint, os, basePath = "/") {
	return endpoint.onEvent("compiler.open", payload => {
		const request = normalizeCompilerRequest(payload, basePath);
		os.addWindow({
			title: `Compile: ${request.manifest.projectName}`,
			content: request.primarySource.content,
			path: request.path,
			extension: extensionOf(request.primarySource.path),
			manifest: request.manifest,
			projectManifest: request.manifest,
			target: request.manifest.target,
			os,
			programName: "awtsmoosCompiler"
		});
	});
}

function normalizeCompilerRequest(payload = {}, basePath) {
	const manifest = createProjectManifest(payload.manifest || legacyManifest(payload));
	return Object.freeze({
		manifest,
		primarySource: manifest.sourceFiles[0],
		path: payload.path || basePath || "/"
	});
}

function legacyManifest(payload) {
	const fileName = payload.fileName || payload.title || "program.c";
	return {
		projectName: fileName.replace(/\.[^.]+$/, ""),
		sourceFiles: [{
			path: fileName.split(/[\/]/).pop(),
			content: String(payload.content ?? "")
		}],
		languageStandard: /\.(cc|cpp|cxx)$/i.test(fileName) ? "c++20" : "c17",
		target: payload.target || "awtsmoos-simulated"
	};
}

function extensionOf(name = "") {
	const match = String(name).match(/(\.[^.\/]+)$/);
	return match?.[1]?.toLowerCase() || ".c";
}
