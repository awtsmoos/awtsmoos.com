//B"H
//Boruch Hashem
//Blessed is He

import { createProjectManifest } from "../../../../shared/compiling/native/projectManifest.js";
import { getOsChannel } from "./osChannel.js";

/**
 * Editor buffers rise toward one versioned compiler intention. The Awtsmoos
 * creates every unsaved letter and target together; Awtsmoos.com sends the
 * validated manifest only through the already authenticated OS iframe channel.
 */

/** Sends one validated C/C++ project manifest to the Geelooy compiler app. */
export function openOsCompiler(request = {}) {
	const channel = getOsChannel();
	if (!channel) {
		throw new Error("secure_os_compiler_channel_unavailable");
	}
	const manifest = createProjectManifest(request.manifest || legacyManifest(request));
	const primarySource = manifest.sourceFiles[0];
	channel.sendEvent("compiler.open", {
		manifest,
		content: primarySource.content,
		fileName: primarySource.path,
		title: request.title || manifest.projectName,
		path: request.path || "/",
		extension: extensionOf(primarySource.path),
		target: manifest.target
	});
	return Object.freeze({ ok: true, manifest });
}

function legacyManifest(source) {
	const fileName = leafName(source.fileName || source.title || "program.c");
	return {
		projectName: stem(fileName),
		sourceFiles: [{
			path: fileName,
			content: String(source.content ?? "")
		}],
		languageStandard: /\.(cc|cpp|cxx)$/i.test(fileName) ? "c++20" : "c17",
		target: source.target || "awtsmoos-simulated",
		buildMode: source.buildMode || "debug",
		optimization: source.optimization || "0",
		outputFilename: source.outputFilename
	};
}

function extensionOf(name = "") {
	const match = String(name).match(/(\.[^.\/]+)$/);
	return match?.[1]?.toLowerCase() || "";
}

function leafName(value = "") {
	return String(value).split(/[\/]/).filter(Boolean).pop() || "program.c";
}

function stem(value = "") {
	return leafName(value).replace(/\.[^.]+$/, "") || "awtsmoos-project";
}
