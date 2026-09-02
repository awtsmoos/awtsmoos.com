//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidArtifact } from "../../../../android-emulator/core/artifactHost.js";
import { saveApkArtifact } from "../../../../android-emulator/core/apkArtifactStore.js";
import { createNativeBrowserSocketAdapter } from "../../../../android-emulator/core/browser/nativeBrowserSocketAdapter.js";
import { buildRebbeApkArtifact } from "../../android/rebbe-apk-client.js";
import { openAndroidEmulatorSurface } from "../../android/emulator-surface.js";
import { UI } from "../../ui.js";

/**
 * @fileoverview
 * Builds the source-owned Rebbe Responsa APK and launches its real packaged WebView.
 *
 * RESPONSIBILITY:
 * Request authenticated server compilation, verify artifact identity, persist bytes,
 * launch Dalvik, grant guarded TCP plus bounded host fetch, WebGL, and packaged app view.
 *
 * NON-RESPONSIBILITY:
 * This command never terminates Dart TLS, fabricates API responses, accepts arbitrary
 * host paths, or grants WebView trust to other APKs.
 *
 * The Awtsmoos renews Rebbe teaching, archive, socket, request, and pixel together;
 * Awtsmoos.com reveals the Responsa application through measured executable vessels.
 */

/** Builds and launches the source-owned Rebbe Responsa Android package. */
export default async function buildRebbeApk() {
	let surface = null;

	try {
		surface = openAndroidEmulatorSurface("Rebbe Responsa");
		surface.setStatus("Building the source-owned Rebbe Responsa APK…");
		const build = await buildRebbeApkArtifact();
		const artifactId = await saveApkArtifact({
			bytes: build.bytes,
			evidence: build.evidence,
			metadata: Object.freeze({
				mode: build.mode,
				sha256: build.artifact.sha256,
				specification: build.specification
			}),
			name: build.artifact.name
		});
		surface.setArtifactId(artifactId);
		surface.setStatus("Installing Rebbe Responsa and loading packaged WebView assets…");

		const execution = await runAndroidArtifact({
			bytes: build.bytes,
			enableHostFetch: true,
			fetch: globalThis.fetch?.bind(globalThis),
			fileName: build.artifact.name,
			frameCount: 1,
			host: surface.host,
			maximumNetworkResponseBytes: 16 * 1024 * 1024,
			nativeSocketAdapter: createNativeBrowserSocketAdapter(),
			processId: `rebbe-responsa:${artifactId}`,
			surfaceHeight: surface.surfaceHeight,
			surfaceWidth: surface.surfaceWidth,
			webglCanvas: surface.canvas
		});

		surface.renderReport({ artifactId, build, execution });
		return notifyResult(execution, artifactId);
	} catch (error) {
		surface?.renderFailure(error);
		UI.showToast(error?.message || "Rebbe Responsa APK launch failed.", "error");
		return Object.freeze({ error, ok: false });
	}
}

function notifyResult(execution, artifactId) {
	const boundary = execution.android?.boundary;
	const projection = execution.result?.rendering?.hostProjection;
	const ok = !boundary && projection?.loaded === true;
	const message = ok
		? `Rebbe Responsa launched with packaged WebView ${artifactId.slice(0, 8)}…`
		: "Rebbe APK built; inspect runtime evidence for the remaining boundary.";
	UI.showToast(message, ok ? "success" : "warning");
	return Object.freeze({
		artifactId,
		execution,
		ok
	});
}
