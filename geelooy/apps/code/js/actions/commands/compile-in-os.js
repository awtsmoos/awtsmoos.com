//B"H
//Boruch Hashem
//Blessed is He

import { openOsCompiler } from "../../embed/osCompilerRequest.js";
import { DOM, State } from "../../state.js";
import { UI } from "../../ui.js";
import { createEditorProjectRequest } from "./compileProjectManifest.js";

/**
 * The current editor and sibling source tabs may be newer than disk. The
 * Awtsmoos creates each unsaved letter in the present instant; Awtsmoos.com
 * sends all living C/C++ buffers inside one versioned project manifest.
 */

/** Opens the active C/C++ project buffers in the Geelooy compiler application. */
export default function compileInOs() {
	try {
		const request = createEditorProjectRequest({
			tabs: State.tabs,
			activeTabId: State.activeTabId,
			activeEditorValue: DOM.editor?.value,
			target: compilerPreference("target", "awtsmoos-simulated"),
			buildMode: compilerPreference("buildMode", "debug"),
			optimization: compilerPreference("optimization", "0"),
			packagingPreference: compilerPreference("packaging", "artifact"),
			signingPreference: compilerPreference("signing", "none"),
			emulatorPreference: compilerPreference("emulator", "auto")
		});
		const response = openOsCompiler(request);
		return notify(
			`Opened ${response.manifest.sourceFiles.length} project buffer(s) in the OS compiler.`,
			"success"
		);
	} catch (error) {
		return notify(errorMessage(error), "error");
	}
}

function compilerPreference(name, fallback) {
	try {
		return globalThis.localStorage?.getItem(`awtsmoos.code.compiler.${name}`) || fallback;
	} catch {
		return fallback;
	}
}

function errorMessage(error) {
	if (error?.code === "ACTIVE_SOURCE_REQUIRED" || error?.code === "ACTIVE_SOURCE_UNSUPPORTED") {
		return error.message;
	}
	if (error?.message === "secure_os_compiler_channel_unavailable") {
		return "Open Apps Code from Geelooy OS before using the shared compiler.";
	}
	return error?.message || "The shared compiler request failed.";
}

function notify(message, type) {
	UI.showToast(message, type);
	return Object.freeze({ ok: type === "success", message });
}
