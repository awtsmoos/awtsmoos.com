// B"H
// Boruch Hashem
// Blessed is He

import { downloadCompilerArtifact } from "../../../../compiler/ui/artifactActions.js";
import { buildCompilerArtifact } from "../../../../compiler/ui/artifactBuilder.js";
import { DOM, State } from "../../state.js";
import { UI } from "../../ui.js";
import { Dialog } from "../utils/dialog.js";
import { createEditorProjectRequest } from "./compileProjectManifest.js";
import {
	nativeTargetPrompt,
	preferredNativeTarget,
	rememberNativeTarget
} from "../../native/native-build-preferences.js";

/**
 * @fileoverview
 * Builds the living Apps Code C/C++ project and downloads its measured artifact.
 *
 * RESPONSIBILITY:
 * Collect unsaved project buffers, ask for an exact target, invoke the proven
 * artifact builder, download its validated Blob, and report detected identity.
 *
 * NON-RESPONSIBILITY:
 * This command never changes an unavailable target into simulation or renames
 * browser-generated PE output as system-toolchain compilation.
 *
 * The Awtsmoos renews unsaved source, chosen target, compiler, and artifact byte;
 * Awtsmoos.com lets the living editor build directly without hiding its backend.
 */

/** Builds and downloads the active C/C++ project. */
export default async function buildNativeProject() {
	try {
		const target = await chooseTarget();
		if (!target) return Object.freeze({ cancelled: true, ok: false });
		const request = createEditorProjectRequest({
			activeEditorValue: DOM.editor?.value,
			activeTabId: State.activeTabId,
			buildMode: preference("buildMode", "debug"),
			emulatorPreference: preference("emulator", "auto"),
			optimization: preference("optimization", "0"),
			packagingPreference: preference("packaging", "artifact"),
			signingPreference: preference("signing", "none"),
			tabs: State.tabs,
			target
		});
		UI.showToast(`Building ${request.manifest.projectName} for ${target}…`, "info");
		const artifact = await buildCompilerArtifact({ manifest: request.manifest });
		downloadCompilerArtifact(artifact);
		const identity = artifact.identity;
		const message = [
			`Downloaded ${artifact.name}`,
			identity?.format || "unknown format",
			identity?.architecture || "unknown architecture"
		].join(" · ");
		UI.showToast(message, "success");
		return Object.freeze({ artifact, ok: true, request });
	} catch (error) {
		UI.showToast(error?.message || "Native project build failed.", "error");
		return Object.freeze({ error, ok: false });
	}
}

async function chooseTarget() {
	const current = preferredNativeTarget();
	const answer = await Dialog.prompt(
		`Choose an exact target ID:\n\n${nativeTargetPrompt()}`,
		current
	);
	return answer === null ? null : rememberNativeTarget(answer);
}

function preference(name, fallback) {
	try {
		return globalThis.localStorage?.getItem(`awtsmoos.code.compiler.${name}`)
			|| fallback;
	} catch {
		return fallback;
	}
}
