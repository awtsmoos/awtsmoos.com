//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidArtifact } from "../../../../android-emulator/core/artifactHost.js";
import { saveApkArtifact } from "../../../../android-emulator/core/apkArtifactStore.js";
import { createNativeBrowserSocketAdapter } from "../../../../android-emulator/core/browser/nativeBrowserSocketAdapter.js";
import { resolveActiveAndroidSource } from "../../android/active-android-source.js";
import { buildAndroidSourceApk } from "../../android/android-source-builder.js";
import { openAndroidEmulatorSurface } from "../../android/emulator-surface.js";
import { DOM, State } from "../../state.js";
import { UI } from "../../ui.js";

/**
 * @fileoverview
 * Builds and launches living Java, Kotlin, or Flutter source through real APK paths.
 *
 * RESPONSIBILITY:
 * Resolve unsaved source, compile, persist genuine APK bytes, grant guarded browser
 * TCP plus bounded host fetch, launch Dalvik, and reveal measured WebGL evidence.
 *
 * NON-RESPONSIBILITY:
 * This command never terminates guest TLS, fabricates network responses, or claims
 * full Kotlin/JVM, Flutter engine, Gradle, signing, or Android SDK parity.
 *
 * The Awtsmoos renews source, compiler, archive, request, pixel, and report together;
 * Awtsmoos.com lets each supported language reveal only the machinery it truly owns.
 */

/** Builds and emulates the active Java, Kotlin, or Dart source. */
export default async function buildAndroidApk() {
	let surface = null;

	try {
		const active = resolveActiveAndroidSource({
			activeEditorValue: DOM.editor?.value,
			activeTabId: State.activeTabId,
			tabs: State.tabs
		});
		surface = openAndroidEmulatorSurface(active.label);
		surface.setStatus(`Compiling ${active.language} into a deterministic APK…`);
		const build = await buildAndroidSourceApk(active);
		const artifactId = await persistBuild(active, build);
		surface.setArtifactId(artifactId);
		surface.setStatus("Installing APK and launching the Android runtime…");
		const execution = await launchBuild(active, build, artifactId, surface);
		surface.renderReport({ artifactId, build, execution });
		return notifyExecution(execution, active, artifactId);
	} catch (error) {
		surface?.renderFailure(error);
		UI.showToast(error?.message || "Android APK build failed.", "error");
		return Object.freeze({ error, ok: false });
	}
}

async function persistBuild(active, build) {
	return saveApkArtifact({
		bytes: build.bytes,
		evidence: build.evidence,
		metadata: Object.freeze({
			language: active.language,
			mode: build.mode,
			sourcePath: active.path,
			specification: build.specification
		}),
		name: active.artifactName
	});
}

function launchBuild(active, build, artifactId, surface) {
	return runAndroidArtifact({
		bytes: build.bytes,
		enableHostFetch: true,
		fetch: globalThis.fetch?.bind(globalThis),
		fileName: active.artifactName,
		frameCount: 1,
		host: surface.host,
		maximumNetworkResponseBytes: 8 * 1024 * 1024,
		nativeSocketAdapter: createNativeBrowserSocketAdapter(),
		processId: `apps-code:${active.language}:${artifactId}`,
		surfaceHeight: surface.surfaceHeight,
		surfaceWidth: surface.surfaceWidth,
		webglCanvas: surface.canvas
	});
}

function notifyExecution(execution, active, artifactId) {
	const boundary = execution.android?.boundary;
	const message = boundary
		? `${active.artifactName} built, but runtime stopped at ${boundary.code}.`
		: `${active.language} APK launched. Artifact ${artifactId.slice(0, 8)}…`;
	UI.showToast(message, boundary ? "warning" : "success");
	return Object.freeze({ artifactId, execution, ok: !boundary });
}
